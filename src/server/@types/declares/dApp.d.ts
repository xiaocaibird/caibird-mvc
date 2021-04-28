/**
 * @Owners cmZhou
 * @Title dApp
 */
import _App from '../../app';

export namespace dApp {
    type AppClass = typeof _App;

    type App<
        TRules extends Caibird.dp.Obj = Caibird.dp.Obj,
        TCtxState extends Caibird.dp.Obj = Caibird.dp.Obj,
        TCtxCustom extends Caibird.dp.Obj = Caibird.dp.Obj,
        TControllerDefaultConfig extends Caibird.dp.Obj | undefined = Caibird.dp.Obj | undefined> = _App<TRules, TCtxState, TCtxCustom, TControllerDefaultConfig>;
}
