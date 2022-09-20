/**
 * @Owners cmZhou
 * @Title DubboClient
 */
import { NacosNamingClient, NacosNamingClientOptions } from 'nacos';

import { AttachmentValue, BaseAttach } from './Encode';
import Socket from './Socket';

type SocketInfo = {
    port: number,
    ip: string,
    index: number,
    baseAttach: BaseAttach,
    socketPool: Socket[],
};

const DEFAULT_SUBSCRIBE_TIMEOUT = 5000;

export default class DubboClient {
    public constructor(private readonly opt: {
        version: string,
        registry: NacosNamingClientOptions,
        services: {
            [k: string]: Caibird.dService.DubboServiceDefine,
        },
        maxSocketPool?: number,

        subscribeTimeout?: number,
        socketTimeout?: number,
        maxRequestBodyLength?: number,

        defaultAttachment?: Caibird.dp.Obj<AttachmentValue>,
        getAttachmentOnRequest?(defaultAttachment?: Caibird.dp.Obj<AttachmentValue>): Caibird.dp.PromiseOrSelf<Caibird.dp.Obj<AttachmentValue>>,
    }) {
        this.client = new NacosNamingClient({
            logger: console,
            ...this.opt.registry,
        });
    }

    private readonly client: NacosNamingClient;

    private readonly serviceSocketInfo: {
        [k: string]: {
            serviceFullName: string,
            index: number,
            socketInfos: SocketInfo[],
        },
    } = {};

    private readonly getServiceLongName = (defineInfo: Caibird.dService.DubboServiceDefine) => `${defineInfo.category}:${defineInfo.interfaceName}:${defineInfo.version}:${defineInfo.group}`;

    private readonly getServiceFullName = (groupName: string, serviceLongName: string) => `${groupName}@@${serviceLongName}`;

    private readonly getError = (msg: string) => new Error(msg);

    public readonly request = async (serviceName: string, methodName: string, req?: unknown) => {
        const serviceDefine = this.opt.services[serviceName];

        if (!serviceDefine) {
            throw this.getError(`${serviceName} no define!`);
        }

        if (!serviceDefine.methods[methodName]) {
            throw this.getError(`${serviceName}.${methodName} no define!`);
        }

        const serviceFullName = this.getServiceFullName(serviceDefine.groupName, this.getServiceLongName(serviceDefine));

        const serviceSocketInfo = this.serviceSocketInfo[serviceFullName];

        if (serviceSocketInfo) {
            if (!serviceSocketInfo.socketInfos.length) {
                throw this.getError(`${serviceFullName} no subscribe`);
            }

            const socketInfo = serviceSocketInfo.socketInfos[serviceSocketInfo.index];
            if (!socketInfo.socketPool.length) {
                throw this.getError(`${serviceFullName} socket pool is empty!`);
            }

            serviceSocketInfo.index++;
            if (serviceSocketInfo.index >= serviceSocketInfo.socketInfos.length) {
                serviceSocketInfo.index = 0;
            }

            let i = 0;
            while (i <= socketInfo.socketPool.length) {
                let socket = socketInfo.socketPool[socketInfo.index];

                if (socket.isDestroy) {
                    socket = new Socket({
                        host: socketInfo.ip,
                        port: socketInfo.port,
                        timeout: this.opt.socketTimeout,
                        maxRequestBodyLength: this.opt.maxRequestBodyLength,
                    });
                    socketInfo.socketPool[socketInfo.index] = socket;
                }

                socketInfo.index++;
                if (socketInfo.index >= socketInfo.socketPool.length) {
                    socketInfo.index = 0;
                }

                if (socket.isConnect || i === socketInfo.socketPool.length) {
                    const customAttachment = this.opt.getAttachmentOnRequest ?
                        await this.opt.getAttachmentOnRequest(this.opt.defaultAttachment) : this.opt.defaultAttachment;
                    return socket.request({
                        attach: {
                            ...socketInfo.baseAttach,
                            _method: methodName,
                            _args: serviceDefine.methods[methodName](req),
                        },
                        customAttachment,
                    });
                }

                i++;
            }
        }

        throw this.getError(`${serviceFullName} no subscribe`);
    };

    public readonly init = async () => {
        await this.client.ready();

        for (const val of Object.values(this.opt.services)) {
            const {
                interfaceName,
                version,
                group,
                groupName,
                category,
            } = val;

            const serviceLongName = this.getServiceLongName(val);

            const serviceInfo = {
                groupName,
                serviceName: serviceLongName,
            };

            const serviceFullName = this.getServiceFullName(groupName, serviceLongName);

            const p = new Promise((resolve, reject) => {
                const onError = () => {
                    try {
                        this.client.unSubscribe(serviceInfo);
                    } catch { }
                };
                let timeout: unknown = setTimeout(() => {
                    reject(this.getError('subscribe timeout'));
                    onError();
                }, this.opt.subscribeTimeout ?? DEFAULT_SUBSCRIBE_TIMEOUT);
                try {
                    this.client.subscribe(serviceInfo, hosts => {
                        if (timeout != null) {
                            clearTimeout(timeout as number);
                            timeout = null;
                        }

                        resolve(hosts);

                        const { maxSocketPool = 3, version: dver } = this.opt;
                        const socketInfos: SocketInfo[] = [];

                        if (hosts.length) {
                            hosts.forEach(item => {
                                if (item.healthy && item.enabled &&
                                    item.metadata.interface === interfaceName &&
                                    item.metadata.version === version &&
                                    item.metadata.group === group &&
                                    item.metadata.category === category) {
                                    const info: SocketInfo = {
                                        ip: item.ip,
                                        port: item.port,
                                        index: 0,
                                        baseAttach: {
                                            _dver: dver,
                                            _interface: item.metadata.interface,
                                            _version: item.metadata.version,
                                            _group: item.metadata.group,
                                            _timeout: parseInt(item.metadata.timeout),
                                        },
                                        socketPool: [],
                                    };

                                    for (let i = 0; i < maxSocketPool; i++) {
                                        const socket = new Socket({
                                            host: item.ip,
                                            port: item.port,
                                            timeout: this.opt.socketTimeout,
                                            maxRequestBodyLength: this.opt.maxRequestBodyLength,
                                        });

                                        info.socketPool.push(socket);
                                    }

                                    socketInfos.push(info);
                                }
                            });

                            this.serviceSocketInfo[serviceFullName] = {
                                index: 0,
                                serviceFullName,
                                socketInfos,
                            };
                        }
                    });
                } catch (e) {
                    reject(e);
                    onError();
                }
            });

            try {
                await p;
            } catch (e) {
                console.error(`${serviceFullName} subscribe fail!`);
                console.error(e);
            }
        }
    };
}
