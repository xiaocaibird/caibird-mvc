/**
 * @Owners cmZhou,zzh
 * @Title public getStringCipher
 * @Details 传参获取加解密方法
 */
import { BinaryLike, BinaryToTextEncoding, CipherKey, Encoding, createCipheriv, createDecipheriv } from 'crypto';

// 加密
const strCipher = (data: string, k: CipherKey, iv: BinaryLike | null,
    alg: string, input_encoding: Encoding, output_encoding: BinaryToTextEncoding, options?: import('stream').TransformOptions) => {
    const cip = createCipheriv(alg, k, iv, options);
    let encrypted = cip.update(data, input_encoding, output_encoding);
    encrypted += cip.final(output_encoding);
    return encrypted;
};

// 解密
const strDecipher = (encrypted: string, k: CipherKey, iv: BinaryLike | null,
    alg: string, input_encoding: BinaryToTextEncoding, output_encoding: Encoding, options?: import('stream').TransformOptions) => {
    const decip = createDecipheriv(alg, k, iv, options);
    let decrypted = decip.update(encrypted, input_encoding, output_encoding);
    decrypted += decip.final(output_encoding);
    return decrypted;
};

const DEFAULT_KEY = 'caibird_default1';
const DEFAULT_IV = 'caibird_default1';
const KEY_LEN = 16;

export const getStringCipher = (key: CipherKey = DEFAULT_KEY, iv: BinaryLike = DEFAULT_IV, params: {
    algorithm?: string,
    encryptInputEncoding?: Encoding,
    encryptOutputEncoding?: BinaryToTextEncoding,
    options?: import('stream').TransformOptions,
} = {}) => {
    const {
        algorithm = 'aes-128-cbc',
        encryptInputEncoding = 'utf8',
        encryptOutputEncoding = 'hex',
    } = params;

    const innerKey = key === DEFAULT_KEY || typeof key !== 'string' ? key :
        strCipher(key, DEFAULT_KEY, iv, algorithm, encryptInputEncoding, encryptOutputEncoding).slice(0, KEY_LEN);

    return {
        encrypt: (data: string) => strCipher(data, innerKey, iv, algorithm, encryptInputEncoding, encryptOutputEncoding),
        decrypt: (encrypted: string) => strDecipher(encrypted, innerKey, iv, algorithm, encryptOutputEncoding, encryptInputEncoding),
    };
};
