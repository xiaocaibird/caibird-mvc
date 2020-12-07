/**
 * @Creater cmZhou
 * @Desc task util
 */

export namespace uTask {
    export const sleep = (delay = 100) => new Promise<undefined>(resolve => {
        setTimeout(resolve, delay);
    });

    export const retry = async <T extends dp.Func>(task: T, opt: {
        maxRunTimes?: number;
        delay?: number;
        shouldRetry?(params: { error: any; nowRunTimes: number }): dp.PromiseOrSelf<boolean>;
    } = {}) => {
        const { maxRunTimes = 5, delay, shouldRetry } = opt;
        const errors = [];
        for (let i = 1; i <= maxRunTimes; i++) {
            try {
                return task() as ReturnType<T>;
            } catch (e) {
                if (!shouldRetry || await shouldRetry({ error: e, nowRunTimes: i })) {
                    errors.push(e);
                    if (delay != null) {
                        await sleep(delay);
                    }
                } else {
                    break;
                }
            }
        }
        throw errors;
    };
}

export default uTask;
