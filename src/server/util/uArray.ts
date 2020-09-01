/**
 * @Creater cmZhou
 * @Desc array工具
 */
import base from '../../public/util/uArray';

const _uArray = {};
// 如果要增加成员，要换成namespace来实现
export const uArray: dp.DeepReadonly<typeof base & typeof _uArray> = {
    ...base,
    ..._uArray
};
export default uArray;
