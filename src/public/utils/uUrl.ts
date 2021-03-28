/**
 * @Owners cmZhou
 * @Title public url工具
 */
import { uHttp } from './uHttp';

export namespace uUrl {
    export const getOssImageFormatUrl = (url: string, opt: { width?: number, height?: number }) => uHttp.urlAddQuery(url, {
        'x-oss-process': `image/format,png,image/resize${opt.height == null ? '' : `,h_${opt.height}`}${opt.width == null ? '' : `,w_${opt.width}`}`,
    });
}

export default uUrl;
