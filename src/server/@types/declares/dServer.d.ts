/**
 * @Owners cmZhou
 * @Title server 常用类型
 */
declare namespace dServer {
    namespace S {
        type AppClass = typeof import('../../app').default;

        type App<
            TRules extends dCaibird.Obj = dCaibird.Obj,
            TState extends dCaibird.Obj = dCaibird.Obj,
            TCustom extends dCaibird.Obj = dCaibird.Obj,
            TControllerDefaultConfig extends dCaibird.Obj | undefined = dCaibird.Obj | undefined> = import('../../app').default<TRules, TState, TCustom, TControllerDefaultConfig>;
    }
}
