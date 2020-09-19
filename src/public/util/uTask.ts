/**
 * @Creater cmZhou
 * @Desc task util
 */

namespace _uTask {
    export const debounce = <T extends dp.Func>(task: T, wait = 60000) => {
        let previous = 0;
        return (...p: dp.GetFuncParams<T>) => {
            const now = Date.now();
            if (now - previous > wait) {
                task(...p);
                previous = now;
            }
        };
    };

    export const sleep = (delay = 100) => new Promise<undefined>(resolve => {
        setTimeout(resolve, delay);
    });

    export const trySeveralTimes = async <T extends dp.Func>(task: T, maxTimes = 20, delay?: number) => {
        let error;
        for (let i = 1; i <= maxTimes; i++) {
            try {
                return task() as ReturnType<T>;
            } catch (e) {
                error = e;
                if (delay != null) {
                    await sleep(delay);
                }
            }
        }
        throw error;
    };

    export const throttle = <T extends dp.Func>(task: T, timeout = 300) => {
        let timer: NodeJS.Timeout;
        return (...p: dp.GetFuncParams<T>) => {
            if (timer != null) {
                clearTimeout(timer);
            }
            timer = setTimeout(() => {
                task(...p);
            }, timeout) as any;
        };
    };
}

export const uTask: dp.DeepReadonly<typeof _uTask> = _uTask;
export default uTask;
