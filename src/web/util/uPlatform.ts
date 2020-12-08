/**
 * @Creater cmZhou
 * @Desc platform 工具
 */
import compareVersions, { CompareOperator } from 'compare-versions';

import { cPlatform } from '../constant/cPlatform';

export namespace uPlatform {
    const OS_NAME_LC = cPlatform.OS_NAME.toLowerCase();

    export const checkOS = (OSName: ePlatform.OsName) => OS_NAME_LC === OSName.toLowerCase();

    export const compareOSVersion = (OSName: ePlatform.OsName, compareVersion: string) => {
        const isOS = checkOS(OSName);

        if (!isOS) return false;

        const str = compareVersion.trim();

        let compare = '';
        let version = '';

        if (str[0] === '<' || str[0] === '>' || str[0] === '=') {
            compare += str[0];
            if ((str[0] === '<' || str[0] === '>') && str[1] === '=') {
                compare += str[1];
                version = str.slice(2);
            } else {
                version = str.slice(1);
            }
        } else {
            compare = '=';
            version = str.slice(1);
        }

        const OSVersion = cPlatform.OS_VERSION.replace('NT ', '');

        return compareVersions.compare(OSVersion, version, compare as CompareOperator);
    };
}

export default uPlatform;
