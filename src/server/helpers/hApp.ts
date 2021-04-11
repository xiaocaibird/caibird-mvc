/**
 * @Owners cmZhou
 * @Title app helper
 */
import { dApp } from '../@types/declares';
import App from '../app';

export abstract class HApp<TApp extends dApp.App> {
    protected constructor(public readonly app: TApp) { }

    public readonly ctx = this.app.helpers.context;

    public readonly mvc = this.app.helpers.mvc;

    public readonly report = App.staticHelpers.report;

    public readonly setting = App.staticHelpers.setting;
}
