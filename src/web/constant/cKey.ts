/**
 * @Creater cmZhou
 * @Desc 常用key
 */
import base from '../../public/constant/cKey';

const _cKey = {};
/* namespace _cKey {

}
 */
export const cKey: dp.DeepReadonly<typeof base & typeof _cKey> = {
    ...base,
    ..._cKey
};
export default cKey;
