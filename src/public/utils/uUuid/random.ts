/**
 * @Owners cmZhou,zzh
 * @Title uuid random函数
 * @Details 获取version4的uuid，随机生成，可去除分隔符
 */
import { v4 } from 'uuid';

import handleUuid from './@core/handleUuid';

export const random = (keepSeparator = false, ...params: Parameters<typeof v4>) => handleUuid(v4(...params), { keepSeparator });
