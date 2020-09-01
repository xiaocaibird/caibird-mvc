/**
 * @Creater cmZhou
 * @Desc task工具
 */
import base from '../../public/util/uTask';

const _uTask = {};
// 如果要增加成员，要换成namespace来实现
export const uTask: dp.DeepReadonly<typeof base & typeof _uTask> = {
    ...base,
    ..._uTask
};
export default uTask;
