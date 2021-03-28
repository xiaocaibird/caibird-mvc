/**
 * @Owners cmZhou
 * @Title navigator helper
 */
import RouterHistory, { createHashHistory } from 'history';

import { uObject } from '../utils/uObject';
import { uString } from '../utils/uString';

export abstract class HNavigator {
    protected constructor(protected readonly options: {
        homePath?: string,
        loginPath?: string,
    } = {}) {
        this.HOME_PATH = options.homePath || '/';
        this.LOGIN_PATH = options.loginPath || '/';
    }

    protected readonly navigator = createHashHistory();
    protected readonly HOME_PATH: string;
    protected readonly LOGIN_PATH: string;

    protected readonly checkPathChange = (route: RouterHistory.LocationDescriptor) => {
        const path = (uObject.check(route) ? route.pathname : route) ?? '';
        if (uString.equalIC(path, location.hash.slice(1))) {
            return false;
        }
        return true;
    };

    public readonly push = (route: RouterHistory.LocationDescriptor) => {
        this.checkPathChange(route) && this.navigator.push(uObject.check(route) ? route : { pathname: route });
    };

    public readonly replace = (route: RouterHistory.LocationDescriptor) => {
        this.checkPathChange(route) && this.navigator.replace(uObject.check(route) ? route : { pathname: route });
    };

    public readonly back = () => {
        this.navigator.goBack();
    };

    public readonly goHome = (isReplace = true) => {
        if (isReplace) {
            this.replace(this.HOME_PATH);
        } else {
            this.push(this.HOME_PATH);
        }
    };

    public readonly resetToHome = () => {
        this.goHome();
        this.reload();
    };

    public readonly goLogin = (isReplace = true) => {
        if (isReplace) {
            this.replace(this.LOGIN_PATH);
        } else {
            this.push(this.LOGIN_PATH);
        }
    };

    public readonly reload = () => {
        location.reload();
    };

    public readonly openUrl = (url: string, target: '_blank' | '_parent' | '_self' | '_top' = '_top') => {
        window.open(url, target);
    };
}
