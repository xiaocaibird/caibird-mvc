/**
 * @Creater cmZhou
 * @Desc crypto util
 */
import base from '../../public/util/uCrypto';

const _uCrypto = {};
// 如果要增加成员，要换成namespace来实现
export const uCrypto: dp.DeepReadonly<typeof base & typeof _uCrypto> = {
    ...base,
    ..._uCrypto
};
export default uCrypto;
