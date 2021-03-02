/**
 * @Creater cmZhou
 * @Desc public 加密工具
 */
import crypto, { HashOptions } from 'crypto';

export namespace uCrypto {
    const defaultPartSize = 100000;
    export const hash = (data: Buffer | string, algorithm: string, opt: HashOptions & {
        partSize?: number,
    } = {}) => {
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

    // 加密
    const strCipher = (data: string, k: crypto.CipherKey, iv: crypto.BinaryLike | null,
        alg: string, input_encoding: crypto.Utf8AsciiBinaryEncoding, output_encoding: crypto.HexBase64BinaryEncoding, options?: import('stream').TransformOptions) => {
        const cip = crypto.createCipheriv(alg, k, iv, options);
        let encrypted = cip.update(data, input_encoding, output_encoding);
        encrypted += cip.final(output_encoding);
        return encrypted;
    };

    // 解密
    const strDecipher = (encrypted: string, k: crypto.CipherKey, iv: crypto.BinaryLike | null,
        alg: string, input_encoding: crypto.HexBase64BinaryEncoding, output_encoding: crypto.Utf8AsciiBinaryEncoding, options?: import('stream').TransformOptions) => {
        const decip = crypto.createDecipheriv(alg, k, iv, options);
        let decrypted = decip.update(encrypted, input_encoding, output_encoding);
        decrypted += decip.final(output_encoding);
        return decrypted;
    };

    export const getStringCipher = (key: crypto.CipherKey = 'caibird-mvc_default_key', iv: crypto.BinaryLike = 'caibird-mvc_default_iv1', params: {
        algorithm?: string,
        encryptInputEncoding?: crypto.Utf8AsciiBinaryEncoding,
        encryptOutputEncoding?: crypto.HexBase64BinaryEncoding,
        options?: import('stream').TransformOptions,
    } = {}) => {
        const {
            algorithm = 'aes-128-cbc',
            encryptInputEncoding = 'utf8',
            encryptOutputEncoding = 'hex'
        } = params;
        return {
            encrypt: (data: string) => strCipher(data, key, iv, algorithm, encryptInputEncoding, encryptOutputEncoding),
            decrypt: (encrypted: string) => strDecipher(encrypted, key, iv, algorithm, encryptOutputEncoding, encryptInputEncoding)
        };
    };
}

export default uCrypto;
