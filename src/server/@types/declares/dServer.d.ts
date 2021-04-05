/**
 * @Owners cmZhou
 * @Title server 常用类型
 */
declare namespace dServer {
    namespace S {
        type AppClass = typeof import('../../app').default;

        type App<
            TRules extends dp.Obj = dp.Obj,
            TState extends dp.Obj = dp.Obj,
            TCustom extends dp.Obj = dp.Obj,
            TControllerDefaultConfig extends dp.Obj | undefined = dp.Obj | undefined> = import('../../app').default<TRules, TState, TCustom, TControllerDefaultConfig>;
    }
}
