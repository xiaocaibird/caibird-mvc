/**
 * Created by cmZhou
 * navigator helper
 */
import RouterHistory, { createHashHistory } from 'history';

import { uObject } from '../util/uObject';
import { uString } from '../util/uString';

export abstract class HNavigator {
    constructor(protected readonly options: {
        homePath?: string;
        loginPath?: string;
    } = {}) {
        this.HOME_PATH = options.homePath || '/';
        this.LOGIN_PATH = options.loginPath || '/';
    }
    protected readonly navigator = createHashHistory();
    protected readonly HOME_PATH: string;
    protected readonly LOGIN_PATH: string;

    protected readonly checkPathChange = (route: RouterHistory.To) => {
        const path = (uObject.check(route) ? route.pathname : route) || '';
        if (uString.equalIgnoreCase(path, location.hash.slice(1))) {
            return false;
        }
        return true;
    }

    public readonly push = (route: RouterHistory.To) => {
        this.checkPathChange(route) && this.navigator.push(uObject.check(route) ? route : { pathname: route });
    }

    public readonly replace = (route: RouterHistory.To) => {
        this.checkPathChange(route) && this.navigator.replace(uObject.check(route) ? route : { pathname: route });
    }

    public readonly back = () => {
        this.navigator.back();
    }

    public readonly goHome = (isReplace = true) => {
        if (isReplace) {
            this.replace(this.HOME_PATH);
        } else {
            this.push(this.HOME_PATH);
        }
    }

    public readonly resetToHome = () => {
        this.goHome();
        this.reload();
    }

    public readonly goLogin = (isReplace = true) => {
        if (isReplace) {
            this.replace(this.LOGIN_PATH);
        } else {
            this.push(this.LOGIN_PATH);
        }
    }

    public readonly reload = () => {
        window.location.reload();
    }

    public readonly openUrl = (url: string, target: '_top' | '_blank' | '_self' | '_parent' = '_top') => {
        window.open(url, target);
    }
}
