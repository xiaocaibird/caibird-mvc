/**
 * @Creater cmZhou
 * @Desc uuid工具
 */
import base from '../../public/util/uUuid';

const _uUuid = {};
// 如果要增加成员，要换成namespace来实现
export const uUuid: dp.DeepReadonly<typeof base & typeof _uUuid> = {
    ...base,
    ..._uUuid
};
export default uUuid;
