/**
 * @Owners cmZhou
 * @Title public常用key
 */
namespace _cKey {
    export const cookie = {
        UUID: 'caibird-mvc_uuid',
    };

    export const query = {
        FORM_REQUEST: 'caibird-mvc_form_request',
    };
}

export const cKey: dp.DeepReadonly<typeof _cKey> = _cKey;
export default cKey;
