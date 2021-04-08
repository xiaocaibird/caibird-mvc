/**
 * @Owners cmZhou
 * @Title app helper
 */
import _App from '../app';

export declare namespace AppDeclare {
    type AppClass = typeof _App;

    type App<
        TRules extends dCaibird.Obj = dCaibird.Obj,
        TState extends dCaibird.Obj = dCaibird.Obj,
        TCustom extends dCaibird.Obj = dCaibird.Obj,
        TControllerDefaultConfig extends dCaibird.Obj | undefined = dCaibird.Obj | undefined> = _App<TRules, TState, TCustom, TControllerDefaultConfig>;
}

export declare namespace AppEnum {
    const enum FilterExecuteType {
        Pre = 0,
        Post = 1,
    }
}

export abstract class HApp<TApp extends AppDeclare.App> {
    protected constructor(public readonly app: TApp) { }

    public readonly ctx = this.app.helpers.context;

    public readonly mvc = this.app.helpers.mvc;

    public readonly report = _App.staticHelpers.report;

    public readonly setting = _App.staticHelpers.setting;
}
