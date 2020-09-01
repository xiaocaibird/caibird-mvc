/**
 * @Creater cmZhou
 * @Desc xml工具
 */
import base from '../../public/util/uXml';

const _uXml = {};
// 如果要增加成员，要换成namespace来实现
export const uXml: dp.DeepReadonly<typeof base & typeof _uXml> = {
    ...base,
    ..._uXml
};
export default uXml;
