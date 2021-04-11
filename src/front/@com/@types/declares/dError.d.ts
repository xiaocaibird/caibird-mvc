/**
 * @Owners cmZhou
 * @Title dError
 */
import { ePrompt } from '../enums';

export namespace dError {
    type Options = {
        key: string,
        msg?: string,
        showPrompt?: ePrompt.Type | false,
        promptStyleType?: ePrompt.StyleType,
        onOk?: Caibird.dp.Func<[], void>,
        onCancel?: Caibird.dp.Func<[], void>,
        onEnd?: Caibird.dp.Func<[], void>,
    };
}
