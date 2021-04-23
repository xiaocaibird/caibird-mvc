/**
 * @Owners cmZhou
 * @Title app helper
 */
import { dApp } from '../@types/declares';

export abstract class HApp<TApp extends dApp.App> {
    protected constructor(public readonly app: TApp) { }

    public readonly ctx: TApp['helpers']['context'] = this.app.helpers.context;

    public readonly mvc: TApp['helpers']['mvc'] = this.app.helpers.mvc;
}
