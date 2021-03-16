/**
 * @Owners cmZhou
 * @Title error 常用类型
 */
declare namespace dError {
    namespace F {
        type Options = {
            key: string,
            msg?: string,
            showPrompt?: ePrompt.F.Type | false,
            promptStyleType?: ePrompt.F.StyleType,
            onOk?: dp.Func<[], void>,
            onCancel?: dp.Func<[], void>,
            onEnd?: dp.Func<[], void>,
        };
    }
}
