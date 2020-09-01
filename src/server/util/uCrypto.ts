/**
 * @Creater cmZhou
 * @Desc crypto util
 */
import crypto from 'crypto';

import base from '../../public/util/uCrypto';

namespace _uCrypto {
    const ALGORITHM = 'aes-256-cbc';
    const INPUT_ENCODING = 'utf8';
    const OUTPUT_ENCODEING = 'hex';
    // 加密
    export const strCipher = (str: string, k: crypto.CipherKey, iv: crypto.BinaryLike | null, alg = ALGORITHM) => {
        let encrypted = '';
        const cip = crypto.createCipheriv(alg, k, iv);
        encrypted += cip.update(str, INPUT_ENCODING, OUTPUT_ENCODEING);
        encrypted += cip.final(OUTPUT_ENCODEING);
        return encrypted;
    };

    // 解密
    export const strDecipher = (str: string, k: crypto.BinaryLike, iv: crypto.BinaryLike | null, alg = ALGORITHM) => {
        let decrypted = '';
        const decip = crypto.createDecipheriv(alg, k, iv);
        decrypted += decip.update(str, OUTPUT_ENCODEING, INPUT_ENCODING);
        decrypted += decip.final(INPUT_ENCODING);
        return decrypted;
    };
}

export const uCrypto: dp.DeepReadonly<typeof base & typeof _uCrypto> = {
    ...base,
    ..._uCrypto
};
export default uCrypto;
