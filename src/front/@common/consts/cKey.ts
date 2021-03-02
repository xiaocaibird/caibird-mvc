/**
 * @Creater cmZhou
 * @Desc 常用key
 */
import base from '../../../public/consts/cKey';

const _cKey = {};
/* namespace _cKey {

}
 */
export const cKey: dp.DeepReadonly<typeof _cKey & typeof base> = {
    ...base,
    ..._cKey,
};
export default cKey;
