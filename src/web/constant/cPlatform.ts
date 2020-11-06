/**
 * @Creater cmZhou
 * @Desc platform 常量
 */
import Bowser from 'bowser';

namespace _cPlatform {
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
}

export const cPlatform: dp.DeepReadonly<typeof _cPlatform> = _cPlatform;
export default cPlatform;
