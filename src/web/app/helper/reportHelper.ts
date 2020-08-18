/**
 * Created by cmZhou
 * web app reportHelper
 */
import { uObject } from '../../util/uObject';
class ReportHelper {
    public static readonly instance: ReportHelper = new ReportHelper();
    private constructor() { }

    private writeLog: (opt: dReport.LogOptions) => void = () => { };

    public readonly setWriteLog = (func: (opt: dReport.LogOptions) => void) => this.writeLog = func;

    public readonly log = (opt: dReport.LogOptions) => {
        try {
            const { details, error, source } = opt;
            this.writeLog(uObject.getSafeJsonObj({
                ...opt,
                details: details && {
                    name: details.name,
                    message: details.message,
                    stack: details.stack,
                    ...details
                },
                error: error && {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                    ...error
                },
                source: source && {
                    name: source.name,
                    message: source.message,
                    stack: source.stack,
                    ...source
                }
            }));
        } catch (e) {
            console.error('writeLog:', e);
        }
    }

    public readonly webLog = (opt: Omit<dReport.LogOptions, 'type'>) =>
        this.log({ ...opt, type: eReport.LogType.WebLog })

    public readonly webError = (opt: Omit<dReport.LogOptions, 'type'>) =>
        this.log({ ...opt, type: eReport.LogType.WebError })

    public readonly webReactError = (opt: Omit<dReport.LogOptions, 'type' | 'always' | 'attribute'>) =>
        this.log({ ...opt, type: eReport.LogType.WebReactError, always: true, attribute: true })

    public readonly webTopError = (opt: Omit<dReport.LogOptions, 'type' | 'always' | 'attribute'>) =>
        this.log({ ...opt, type: eReport.LogType.WebTopError, always: true, attribute: true })
}

const reportHelper = ReportHelper.instance;
export default reportHelper;
