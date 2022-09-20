/**
 * @Owners cmZhou
 * @Title rpc Encode
 */
import { EncoderV2 } from 'hessian.js';

import { uObject } from '../../utils/uObject';

const DEFAULT_MAX_LEN = 8388608; // 8 * 1024 * 1024, default maximum length of body

type ArgItem = {
    $class: string,
    $: unknown,
};

export type BaseAttach = {
    _dver: string,
    _interface: string,
    _version: string,
    _group: string,
    _timeout: number,
};

export type AttachmentValue = boolean | number | string | null | undefined;

export type SocketAttach = BaseAttach & {
    _method: string,
    _args: ArgItem[],
};

export default class Encode {
    public constructor(
        private readonly opt: {
            maxBodyLength?: number,
        },
        private readonly attach: SocketAttach,
        private readonly customAttachment?: Caibird.dp.Obj<AttachmentValue>) {
    }

    private readonly head = (len: number) => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const head = Buffer.from([0xDA, 0xBB, 0xC2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

        const maxLength = this.opt.maxBodyLength ?? DEFAULT_MAX_LEN;

        if (len > maxLength) {
            throw new Error(`Data length too large: ${len}, maximum payload: ${maxLength}`);
        }
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        head.writeInt32BE(len, 12);
        return head;
    };

    private readonly body = (args?: ArgItem[]) => {
        const body = new EncoderV2();
        const ver = this.attach._dver || '2.5.3.6';
        body.write(ver);
        body.write(this.attach._interface);
        body.write(this.attach._version);
        body.write(this.attach._method);

        if (ver.startsWith('2.8')) {
            body.write(-1); // for dubbox 2.8.X
        }
        body.write(this.argsType(args));
        if (args?.length) {
            for (let i = 0, len = args.length; i < len; i++) {
                body.write(args[i]);
            }
        }
        body.write(this.attachments());
        return body.byteBuffer._bytes.slice(0, body.byteBuffer._offset);
    };

    private readonly argsType = (args?: ArgItem[]) => {
        if (!(args?.length)) {
            return '';
        }

        const typeRef = {
            boolean: 'Z',
            int: 'I',
            short: 'S',
            long: 'J',
            double: 'D',
            float: 'F',
        };

        let parameterTypes = '';
        let type: string;

        for (let i = 0, l = args.length; i < l; i++) {
            type = args[i].$class;

            if (type.startsWith('[')) {
                // eslint-disable-next-line no-bitwise
                parameterTypes += ~type.indexOf('.')
                    ? `[L${type.slice(1).replace(/\./gi, '/')};`
                    : `[${typeRef[type.slice(1) as keyof typeof typeRef]}`;
            } else {
                parameterTypes +=
                    // eslint-disable-next-line no-bitwise
                    type && ~type.indexOf('.') ? `L${type.replace(/\./gi, '/')};` : typeRef[type as keyof typeof typeRef];
            }
        }

        return parameterTypes;
    };

    private readonly attachments = () => {
        const implicitArgs = uObject.removeUndefinedProp({
            interface: this.attach._interface,
            path: this.attach._interface,
            timeout: this.attach._timeout,
            version: this.attach._version || undefined,
            group: this.attach._group || undefined,
            ...this.customAttachment,
        });

        return {
            $class: 'java.util.HashMap',
            $: implicitArgs,
        };
    };

    public readonly buffer = () => {
        const body = this.body(this.attach._args);
        const head = this.head(body.length);
        return Buffer.concat([head, body]);
    };
}
