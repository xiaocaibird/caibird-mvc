/**
 * @Owners cmZhou
 * @Title dApp
 */
import _App from '../../app';

export namespace dApp {
    type AppClass = typeof _App;

    type App<
        TRules extends Caibird.dp.Obj = Caibird.dp.Obj,
        TState extends Caibird.dp.Obj = Caibird.dp.Obj,
        TCustom extends Caibird.dp.Obj = Caibird.dp.Obj,
        TControllerDefaultConfig extends Caibird.dp.Obj | undefined = Caibird.dp.Obj | undefined> = _App<TRules, TState, TCustom, TControllerDefaultConfig>;
}
