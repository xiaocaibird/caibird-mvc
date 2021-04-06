/**
 * @Owners cmZhou,zzh
 * @Title uuid get函数
 * @Details 获取version1的uuid，依据timestamp，可去除分隔符
 */
import { v1 } from 'uuid';

import handleUuid from './@core/handleUuid';

export const get = (keepSeparator = false, ...params: dp.GetFuncParams<typeof v1>) => handleUuid(v1(...params), { keepSeparator });
