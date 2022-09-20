/**
 * @Owners cmZhou
 * @Title DubboClient
 */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import * as net from 'net';

import Encode, { AttachmentValue, SocketAttach } from './Encode';
import decode from './decode';

type RequestOpt = {
    attach: SocketAttach,
    customAttachment?: Caibird.dp.Obj<AttachmentValue>,
};

const enum ESocketStep {
    Fail = -10,

    WaitConnect = 0,
    Requesting = 1,

    Success = 10,
}

const SOCKET_HEART_BEAT_TIMESPAN = 5000;

const HEADER_LENGTH = 16;
const FLAG_EVENT = 0x20;

export default class Socket {
    public constructor(private readonly opt: {
        port: number,
        host: string,
        timeout?: number,
        maxRequestBodyLength?: number,
    }) {
        this.timeout = opt.timeout ?? 10000;

        this.socket = net.connect(this.opt.port, this.opt.host);
        this.isConnectPromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(false);
                this.destroy();
            }, this.timeout);

            this.socket.once('connect', () => {
                this.socket.on('data', this.onData);

                this.heartBeatInter = setInterval(() => {
                    if (!this.isRequesting) {
                        this.request({
                            isHeartBeat: true,
                        });
                    }
                }, SOCKET_HEART_BEAT_TIMESPAN);

                resolve(true);
                this._isConnect = true;
                clearTimeout(timeout);
            });
            this.socket.on('error', this.onError);
        });
    }

    private readonly timeout: number;

    private _isDestroy = false;

    private _isConnect = false;
    private isConnectPromise: Promise<boolean>;

    private lastRequestPromise: Promise<unknown> = Promise.resolve();

    private dataChunks: Buffer[] = [];
    private nowDataLength = 0;
    private totalDataLength = HEADER_LENGTH;
    private requestResolve?: (data: unknown) => void;
    private requestReject?: (err: Error) => void;

    private requestCount = 0;

    private readonly socket: net.Socket;

    private heartBeatInter?: unknown;

    public get isDestroy() {
        return this._isDestroy;
    }

    public get isConnect() {
        return this._isConnect;
    }

    public get isRequesting() {
        return !!this.requestCount;
    }

    private readonly destroy = () => {
        if (this.isDestroy) return;

        this._isDestroy = true;

        this._isConnect = false;
        this.isConnectPromise = Promise.resolve(false);

        this.lastRequestPromise = Promise.resolve();

        this.clearRequestInfo();

        this.requestCount = 0;

        try {
            this.socket.end();
        } catch (e) {
            console.error('socket end fail!');
            console.error(e);
        }
        try {
            this.socket.destroy();
        } catch (e) {
            console.error('socket destroy fail!');
            console.error(e);
        }

        this.heartBeatInter != null && clearInterval(this.heartBeatInter as number);
    };

    private readonly getError = (msg: string) => new Error(`[${this.opt.host}:${this.opt.port}] ${msg}`);

    private readonly deSerialize = (data: Buffer) => {
        // eslint-disable-next-line no-bitwise
        if ((data[2] & FLAG_EVENT) === 0) {
            decode(data, (err, result) => {
                if (err) {
                    this.requestReject && this.requestReject(err);
                } else {
                    this.requestResolve && this.requestResolve(result);
                }
                this.clearRequestInfo();
            });
        } else {
            this.requestResolve && this.requestResolve('heart beat success');
            this.clearRequestInfo();
        }
    };

    private readonly clearRequestInfo = () => {
        this.dataChunks = [];
        this.nowDataLength = 0;
        this.totalDataLength = HEADER_LENGTH;
        this.requestResolve = undefined;
        this.requestReject = undefined;
    };

    private readonly onData = (data: Buffer) => {
        if (!this.dataChunks.length) {
            this.totalDataLength += data.readInt32BE(12);
        }
        this.dataChunks.push(data);
        this.nowDataLength += data.length;
        if (this.nowDataLength === this.totalDataLength) {
            this.deSerialize(Buffer.concat(this.dataChunks));
        }
    };

    private readonly onError = (err: Error) => {
        // TODO 某些 Error 可以不用destroy
        this.destroy();
        this.requestReject && this.requestReject(err);
        console.error(err);
    };

    private readonly getLastRequestPromiseResult = async () => {
        try {
            await this.lastRequestPromise;
        } catch { }
    };

    private readonly createRequestPromise = (buffer: Buffer) => new Promise((resolve, reject) => {
        this.requestResolve = resolve;
        this.requestReject = reject;
        this.socket.write(buffer);
        setTimeout(() => { reject(this.getError('socket requestPromise timeout')); }, this.timeout);
    });

    public readonly request = <THeartBeat extends boolean | undefined = undefined>(opt: (
        THeartBeat extends true ? Caibird.dp.Obj : RequestOpt
        // eslint-disable-next-line no-async-promise-executor
    ) & { isHeartBeat?: THeartBeat }) => new Promise(async (resolve, reject) => {
        let step = ESocketStep.WaitConnect;
        let isClear = false;
        this.requestCount++;

        const clear = () => {
            if (!isClear) {
                isClear = true;
                this.requestCount--;
                this.clearRequestInfo();
            }
        };

        const timeout = setTimeout(() => {
            reject(this.getError('socket request timeout'));
            clear();
            if (step === ESocketStep.WaitConnect) {
                this.destroy();
            }
        }, this.timeout);

        try {
            if (this.isDestroy) {
                throw this.getError('socket is destroyed');
            }

            if (!await this.isConnectPromise) {
                this.destroy();
                throw this.getError('sokcet no connect');
            }

            step = ESocketStep.Requesting;
            await this.getLastRequestPromiseResult();

            if (this.isDestroy) {
                throw this.getError('socket is destroyed');
            }

            let buffer: Buffer;

            if (opt.isHeartBeat) {
                buffer = Buffer.from([
                    0xDA, 0xBB, // MAGIC
                    0xE2, // FLAG
                    0, // STATUS
                    0, 0, 0, 0, 0, 0, 0, 0, // INVOKE ID
                    0, 0, 0, 0x01, // BODY LENGTH
                    0x4E, // BODY CONTENT
                ]);
            } else {
                const options = opt as unknown as RequestOpt;
                buffer = new Encode(
                    { maxBodyLength: this.opt.maxRequestBodyLength },
                    options.attach,
                    options.customAttachment,
                ).buffer();
            }

            const p = this.createRequestPromise(buffer);
            this.lastRequestPromise = p;

            const rsp = await p;

            resolve(rsp);
            step = ESocketStep.Success;
        } catch (e) {
            reject(e);
            step = ESocketStep.Fail;
        } finally {
            clearTimeout(timeout);
            clear();
        }
    });
}
