/**
 * Created by cmZhou
 * string工具
 */
import base from '../../public/util/uString';

const _uString = {};
// 如果要增加成员，要换成namespace来实现
export const uString: dp.DeepReadonly<typeof base & typeof _uString> = {
    ...base,
    ..._uString
};
export default uString;
