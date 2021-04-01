/**
 * @Owners cmZhou,zzh
 * @Title xml parse函数
 * @Details 解析xml字符串
 */
import { OptionsV2, parseString } from 'xml2js';

class XmlError extends Error {}

export const parse = async <T extends dp.Obj>(xmlStr: string, options: OptionsV2 & { timeout?: number } = {}) => new Promise<T>((resolve, reject) => {
    const { timeout = eDate.MsTimespan.PromiseTimeout } = options;

    if (options.explicitArray === undefined) {
        options.explicitArray = false;
    }
    parseString(xmlStr, options, (err, result: T) => {
        if (err) {
            reject(err);
        }
        resolve(result);
    });
    setTimeout(() => { reject(new XmlError('解析xml超时')); }, timeout);
});

export default parse;