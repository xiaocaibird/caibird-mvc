/**
 * @Owners cmZhou,zzh
 * @Title public array jsonParse方法
 */
import { check } from './check';

export const jsonParse = <T>(str: string): T[] => {
    const dft: T[] = [];
    try {
        const arr: unknown = JSON.parse(str);
        return check<T>(arr) ? arr : dft;
    } catch {
        return dft;
    }
};
