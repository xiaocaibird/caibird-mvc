/**
 * @Owners cmZhou
 * @Title rpc decode
 */
import { DecoderV2 } from 'hessian.js';
const enum Response {
    OK = 20,
    CLIENT_TIMEOUT = 30,
    SERVER_TIMEOUT = 31,
    BAD_REQUEST = 40,
    BAD_RESPONSE = 50,
    SERVICE_NOT_FOUND = 60,
    SERVICE_ERROR = 70,
    SERVER_ERROR = 80,
    CLIENT_ERROR = 90,
}

const RESPONSE_WITH_EXCEPTION = 0;
const RESPONSE_VALUE = 1;
const RESPONSE_NULL_VALUE = 2;
const RESPONSE_WITH_EXCEPTION_WITH_ATTACHMENTS = 3;
const RESPONSE_VALUE_WITH_ATTACHMENTS = 4;
const RESPONSE_NULL_VALUE_WITH_ATTACHMENTS = 5;

const HEAP_HEADER_LENGTH = 16;

const decode = (heap: Buffer, cb: (err: Error | null, data?: unknown) => void) => {
    const result = new DecoderV2(heap.slice(HEAP_HEADER_LENGTH, heap.length));
    if (heap[3] !== Response.OK) {
        cb(new Error(result.readString()));
        return;
    }
    try {
        const flag = result.readInt();

        switch (flag) {
            case RESPONSE_NULL_VALUE:
            case RESPONSE_NULL_VALUE_WITH_ATTACHMENTS:
                cb(null, null);
                break;
            case RESPONSE_VALUE:
            case RESPONSE_VALUE_WITH_ATTACHMENTS:
                cb(null, result.read());
                break;
            case RESPONSE_WITH_EXCEPTION:
            case RESPONSE_WITH_EXCEPTION_WITH_ATTACHMENTS:
                let excep = result.read();
                if (!(excep instanceof Error)) {
                    excep = new Error(excep as string);
                }
                cb(excep as Error);
                break;
            default:
                cb(new Error(`Unknown result flag, expect '0' '1' '2' '3' '4' '5', get ${flag}`));
        }
    } catch (err: unknown) {
        cb(err as Error);
    }
};

export default decode;
