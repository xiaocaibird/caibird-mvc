/**
 * @Owners cmZhou
 * @Title public常用key
 */
namespace _cKey {
    export const cookie = {
        UUID: 'caibird_uuid',
    };

    export const query = {
        FORM_REQUEST: 'caibird_form_request',
    };
}

export const cKey: dp.DeepReadonly<typeof _cKey> = _cKey;
export default cKey;
