/**
 * @Creater cmZhou
 * @Desc platform 工具
 */
import Bowser from 'bowser';
import compareVersions, { CompareOperator } from 'compare-versions';

namespace _uPlatform {
    const bowser = Bowser.getParser(navigator.userAgent);

    export const OS_NAME = bowser.getOSName();
    const OS_NAME_LC = OS_NAME.toLowerCase();

    export const OS_VERSION = bowser.getOSVersion();

    export const isIOS = OS_NAME_LC === ePlatform.OsName.IOS.toLowerCase();
    export const isAndroid = OS_NAME_LC === ePlatform.OsName.Android.toLowerCase();
    export const isMobile = isIOS || isAndroid;

    export const isWindows = OS_NAME_LC === ePlatform.OsName.Windows.toLowerCase();
    export const isMacOS = OS_NAME_LC === ePlatform.OsName.MacOS.toLowerCase();
    export const isLinux = OS_NAME_LC === ePlatform.OsName.Linux.toLowerCase();
    export const isPC = isWindows || isMacOS || isLinux;

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

        const OSVersion = OS_VERSION.replace('NT ', '');

        return compareVersions.compare(OSVersion, version, compare as CompareOperator);
    };
}

export const uPlatform: dp.DeepReadonly<typeof _uPlatform> = _uPlatform;
export default uPlatform;
