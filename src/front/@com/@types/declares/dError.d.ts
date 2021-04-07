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
            onOk?: dCaibird.Func<[], void>,
            onCancel?: dCaibird.Func<[], void>,
            onEnd?: dCaibird.Func<[], void>,
        };
    }
}
