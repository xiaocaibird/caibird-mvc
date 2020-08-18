/**
 * Created by cmZhou
 * http工具
 */
import base from '../../public/util/uHttp';

const _uHttp = {};
// 如果要增加成员，要换成namespace来实现
export const uHttp: dp.DeepReadonly<typeof base & typeof _uHttp> = {
    ...base,
    ..._uHttp
};
export default uHttp;
