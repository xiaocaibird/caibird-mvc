/**
 * @Owners cmZhou
 * @Title navigator helper
 */
import RouterHistory, { createHashHistory } from 'history';

import { uObject } from '../utils/uObject';
import { uString } from '../utils/uString';

export abstract class HNavigator {
    protected constructor() {
    }

    protected readonly navigator = createHashHistory();

    protected readonly checkPathChange = (route: RouterHistory.To) => {
        const path = (uObject.check(route) ? route.pathname : route) ?? '';
        if (uString.equalIC(path, location.hash.slice(1))) {
            return false;
        }
        return true;
    };

    public readonly push = (route: RouterHistory.To) => {
        this.checkPathChange(route) && this.navigator.push(uObject.check(route) ? route : { pathname: route });
    };

    public readonly replace = (route: RouterHistory.To) => {
        this.checkPathChange(route) && this.navigator.replace(uObject.check(route) ? route : { pathname: route });
    };

    public readonly back = () => {
        this.navigator.back();
    };

    public readonly reload = () => {
        location.reload();
    };

    public readonly openUrl = (url: string, target: '_blank' | '_parent' | '_self' | '_top' = '_top') => {
        window.open(url, target);
    };
}
