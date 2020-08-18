/**
 * Created by cmZhou
 * tree工具
 */
import base from '../../public/util/uTree';

const _uTree = {};
// 如果要增加成员，要换成namespace来实现
export const uTree: dp.DeepReadonly<typeof base & typeof _uTree> = {
    ...base,
    ..._uTree
};
export default uTree;
