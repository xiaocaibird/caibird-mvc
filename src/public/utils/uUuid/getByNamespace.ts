/**
 * @Owners cmZhou,zzh
 * @Title uuid getByNamespace函数
 * @Details 获取version5的uuid，依据namespace，可去除分隔符
 */
import { v5 } from 'uuid';

import handleUuid from './@core/handleUuid';

export const getByNamespace = (keepSeparator = false, ...params: dp.GetFuncParams<typeof v5>) => handleUuid(v5(...params), { keepSeparator });
