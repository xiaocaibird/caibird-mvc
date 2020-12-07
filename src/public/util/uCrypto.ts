/**
 * @Creater cmZhou
 * @Desc public 加密工具
 */
import crypto, { HashOptions } from 'crypto';

export namespace uCrypto {
    const defaultPartSize = 100000;
    export const hash = (data: string | Buffer, algorithm: string, opt: {
        partSize?: number;
    } & HashOptions = {}) => {
        const { partSize = defaultPartSize } = opt;
        const h = crypto.createHash(algorithm, opt);
        const total = Math.ceil(data.length / partSize);
        for (let i = 0; i < total; i++) {
            const part = data.slice(i * partSize,
                i === total - 1 ? Math.min((i + 1) * partSize, data.length) : (i + 1) * partSize);
            h.update(part);
        }
        return h.digest('hex');
    };

    const strEncrypt = (str: string, key: string, iv: crypto.BinaryLike) => {
        const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
        let crypted = cipher.update(str, 'utf8', 'hex');
        crypted += cipher.final('hex');
        return crypted;
    };

    const strDecrypt = (encrypted: string, key: string, iv: crypto.BinaryLike) => {
        const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    };

    export const stringCrypt = (key = 'caibird-mvc_default_key', iv: crypto.BinaryLike = 'caibird-mvc_default_iv1') => ({
        encrypt: (str: string) => strEncrypt(str, key, iv),
        decrypt: (encrypted: string) => strDecrypt(encrypted, key, iv)
    });
}

export default uCrypto;
