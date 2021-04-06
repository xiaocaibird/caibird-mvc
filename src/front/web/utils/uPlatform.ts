/**
 * @Owners cmZhou
 * @Title platform 工具
 */
import compareVersions, { CompareOperator } from 'compare-versions';

import { cPlatform } from '../consts/cPlatform';

export namespace uPlatform {
    const OS_NAME_LC = cPlatform.OS_NAME.toLowerCase();

    export const checkOS = (OSName: ePlatform.F.OsName) => OS_NAME_LC === OSName.toLowerCase();

    export const compareOSVersion = (OSName: ePlatform.F.OsName, compareVersion: string) => {
        const isOS = checkOS(OSName);

        if (!isOS) return false;

        const str = compareVersion.trim();

        let compare = '';
        let version = '';

        if (str.startsWith('<') || str.startsWith('>') || str.startsWith('=')) {
            compare += str[0];
            if ((str.startsWith('<') || str.startsWith('>')) && str[1] === '=') {
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

