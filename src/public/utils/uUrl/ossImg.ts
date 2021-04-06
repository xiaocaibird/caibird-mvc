/**
 * @Owners cmZhou,zzh
 * @Title public ossImg函数
 * @Details 给oss图片添加宽高参数
 */
import { uHttp } from '../uHttp';

export const ossImg = (url: string, opt: { width?: number, height?: number }) => uHttp.urlAddQuery(url, {
    'x-oss-process': `image/format,png,image/resize${opt.height == null ? '' : `,h_${opt.height}`}${opt.width == null ? '' : `,w_${opt.width}`}`,
});
