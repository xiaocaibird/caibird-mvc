/**
 * @Owners cmZhou,zzh
 * @Title public hash方法
 */
import { HashOptions, createHash } from 'crypto';
const defaultPartSize = 100000;
export const hash = (data: Buffer | string, algorithm: string, opt: HashOptions & {
    partSize?: number,
} = {}) => {
    const { partSize = defaultPartSize } = opt;
    const h = createHash(algorithm, opt);
    const total = Math.ceil(data.length / partSize);
    for (let i = 0; i < total; i++) {
        const part = data.slice(i * partSize,
            i === total - 1 ? Math.min((i + 1) * partSize, data.length) : (i + 1) * partSize);
        h.update(part);
    }
    return h.digest('hex');
};
