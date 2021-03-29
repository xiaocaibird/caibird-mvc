/**
 * @Owners zzh
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

export const getStringCipher = (key: CipherKey = 'caibird_default_key', iv: BinaryLike = 'caibird_default_iv1', params: {
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
    return {
        encrypt: (data: string) => strCipher(data, key, iv, algorithm, encryptInputEncoding, encryptOutputEncoding),
        decrypt: (encrypted: string) => strDecipher(encrypted, key, iv, algorithm, encryptOutputEncoding, encryptInputEncoding),
    };
};

export default getStringCipher;
