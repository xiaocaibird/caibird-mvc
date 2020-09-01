/**
 * @Creater cmZhou
 * @Desc error 常用类型
 */
declare namespace dError {
    type Options = {
        msg?: string;
        showPrompt?: ePrompt.Type | false;
        promptStyleType?: ePrompt.StyleType;
        onOk?: dp.Func<[], void>;
        onCancel?: dp.Func<[], void>;
        onEnd?: dp.Func<[], void>;
    };
}
