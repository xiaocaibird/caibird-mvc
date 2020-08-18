/**
 * Created by cmZhou
 * number工具
 */
import base from '../../public/util/uNumber';

const _uNumber = {};
// 如果要增加成员，要换成namespace来实现
export const uNumber: dp.DeepReadonly<typeof base & typeof _uNumber> = {
    ...base,
    ..._uNumber
};
export default uNumber;
