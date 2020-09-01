/**
 * @Creater cmZhou
 * @Desc public常用key
 */
namespace _cKey {
    export const cookie = {
        UUID: 'caibird-mvc_uuid'
    };

    export const query = {
        FORM_REQUEST: '_caibird-mvc_form_request_',
        VIDEO_POSTER: '_caibird-mvc_video_poster_',
        ASSET_NAME: '_caibird-mvc_asset_name_'
    };
}

export const cKey: dp.DeepReadonly<typeof _cKey> = _cKey;
export default cKey;
