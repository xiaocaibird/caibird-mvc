/**
 * @Creater cmZhou
 * @Desc 函数工具
 */
import base from '../../public/util/uFunction';

const _uFunction = {};
// 如果要增加成员，要换成namespace来实现
export const uFunction: dp.DeepReadonly<typeof base & typeof _uFunction> = {
    ...base,
    ..._uFunction
};
export default uFunction;
