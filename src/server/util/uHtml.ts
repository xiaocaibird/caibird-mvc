/**
 * Created by cmZhou
 * html工具
 */
import base from '../../public/util/uHtml';

const _uHtml = {};
// 如果要增加成员，要换成namespace来实现
export const uHtml: dp.DeepReadonly<typeof base & typeof _uHtml> = {
    ...base,
    ..._uHtml
};
export default uHtml;
