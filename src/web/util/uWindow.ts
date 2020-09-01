/**
 * @Creater cmZhou
 * @Desc window 工具
 */
namespace _uWindow {
    const agents = new Array('Android', 'iPhone', 'SymbianOS', 'Windows Phone');
    let _systemName = 'PC';
    for (const agent of agents) {
        if (navigator.userAgent.includes(agent)) { _systemName = agent; break; }
    }

    export const systemName = _systemName;
    export const isIOS = systemName.toLowerCase() === 'iphone' ? true : false;
    export const isAndroid = systemName.toLowerCase() === 'android' ? true : false;
    export const isPC = systemName.toLowerCase() === 'pc' ? true : false;

    export const getDocumentWidth = (type: 'client' | 'offset' = 'client') => {
        if (type === 'client') {
            return document.documentElement && document.documentElement.clientWidth || 0;
        }

        return document.documentElement && document.documentElement.offsetWidth || 0;
    };
    export const getDocumentHeight = (type: 'client' | 'offset' = 'client') => {
        if (type === 'client') {
            return document.documentElement && document.documentElement.clientHeight || 0;
        }

        return document.documentElement && document.documentElement.offsetHeight || 0;
    };
    export const getWindowWidth = (type: 'outer' | 'inner' = 'outer') => {
        if (type === 'outer') {
            return window.outerWidth;
        }

        return window.innerWidth;
    };
    export const getWindowHeight = (type: 'outer' | 'inner' = 'outer') => {
        if (type === 'outer') {
            return window.outerHeight;
        }

        return window.innerHeight;
    };
    export const getScreenWidth = (type: 'avail' = 'avail') => {
        if (type === 'avail') {
            return window.screen.availWidth;
        }

        return window.screen.width;
    };
    export const getScreenHeight = (type: 'avail' = 'avail') => {
        if (type === 'avail') {
            return window.screen.availHeight;
        }

        return window.screen.height;
    };
}

export const uWindow: dp.DeepReadonly<typeof _uWindow> = _uWindow;
export default uWindow;
