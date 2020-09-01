/**
 * @Creater cmZhou
 * @Desc obj工具
 */
import base from '../../public/util/uObject';

const _uObject = {};
// 如果要增加成员，要换成namespace来实现
export const uObject: dp.DeepReadonly<typeof base & typeof _uObject> = {
    ...base,
    ..._uObject
};
export default uObject;
