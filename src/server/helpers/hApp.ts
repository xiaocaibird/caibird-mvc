/**
 * @Owners cmZhou
 * @Title app helper
 */
import _App from '../app';

export declare namespace dApp {
    type AppClass = typeof _App;

    type App<
        TRules extends Caibird.dp.Obj = Caibird.dp.Obj,
        TState extends Caibird.dp.Obj = Caibird.dp.Obj,
        TCustom extends Caibird.dp.Obj = Caibird.dp.Obj,
        TControllerDefaultConfig extends Caibird.dp.Obj | undefined = Caibird.dp.Obj | undefined> = _App<TRules, TState, TCustom, TControllerDefaultConfig>;
}

export declare namespace eApp {
    const enum FilterExecuteType {
        Pre = 0,
        Post = 1,
    }
}

export abstract class HApp<TApp extends dApp.App> {
    protected constructor(public readonly app: TApp) { }

    public readonly ctx = this.app.helpers.context;

    public readonly mvc = this.app.helpers.mvc;

    public readonly report = _App.staticHelpers.report;

    public readonly setting = _App.staticHelpers.setting;
}
