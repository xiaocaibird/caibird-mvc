/**
 * @Owners cmZhou
 * @Title web app
 */
import { setIsCompatibleHandler, setOnAppError } from '../consts/cError';

import { reportHelper, setWriteLog } from './helpers/reportHelper';

export default class App {
    public static readonly staticHelpers = {
        report: {
            ...reportHelper,
        },
    } as const;

    public constructor(public readonly options: Options) {
        const { writeLog } = options;
        this.initError();
        writeLog && setWriteLog(writeLog);
    }

    private readonly initError = () => {
        const { onAppError, isCompatibleAppErrorHandler } = this.options;
        onAppError && setOnAppError(onAppError);
        setIsCompatibleHandler(!!isCompatibleAppErrorHandler);
    };

    public readonly start = async (opt: StartOpt) => {
        const { allowOpenInIframe, preRender, postRender } = this.options;
        if (!allowOpenInIframe && top !== self) {
            window.open(location.href, '_top');
            return;
        }

        if (!opt.rootDom) {
            throw new Error('React Root Dom 不能为空！');
        }

        preRender && await preRender(this);

        const reactDom = await import('react-dom/client');
        const root = reactDom.createRoot(opt.rootDom);
        root.render(opt.rootComponent);

        postRender && await postRender(this);
    };
}

type Options = {
    allowOpenInIframe?: boolean,
    isCompatibleAppErrorHandler?: boolean,
    writeLog?: Parameters<typeof setWriteLog>[0],
    onAppError?(err: unknown): Caibird.dp.PromiseOrSelf<void>,
    preRender?(app: App): Caibird.dp.PromiseOrSelf<void>,
    postRender?(app: App): Caibird.dp.PromiseOrSelf<void>,
};

type StartOpt = {
    rootComponent: React.ReactElement,
    rootDom: Element | null,
};
