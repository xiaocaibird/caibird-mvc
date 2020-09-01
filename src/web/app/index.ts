/**
 * @Creater cmZhou
 * @Desc web app
 */
import { setOnAppError } from '../constant/cError';

import reportHelper from './helper/reportHelper';

export default class App {
    public static readonly staticHelpers = {
        report: {
            ...reportHelper
        }
    } as const;

    constructor(public readonly options: Options) {
        const { writeLog } = options;
        this.initError();
        writeLog && reportHelper.setWriteLog(writeLog);
    }

    private readonly initError = () => {
        const { onAppError } = this.options;
        onAppError && setOnAppError(onAppError);
    }

    public readonly start = async (opt: StartOpt) => {
        const { allowOpenInIframe, preRender, postRender } = this.options;
        if (!allowOpenInIframe && top !== self) {
            window.open(location.href, '_top');
            return;
        }

        preRender && await preRender(this);
        (await import('react-dom')).render(opt.rootComponent, opt.rootDom);
        postRender && await postRender(this);
    }
}

type Options = {
    allowOpenInIframe?: boolean;
    writeLog?: typeof reportHelper['writeLog'];
    onAppError?(err: Error): any;
    preRender?(app: App): dp.PromiseOrSelf<void>;
    postRender?(app: App): dp.PromiseOrSelf<void>;
};

type StartOpt = {
    rootComponent: React.ReactElement;
    rootDom: Element | null;
};
