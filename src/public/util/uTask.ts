/**
 * @Creater cmZhou
 * @Desc task util
 */

namespace _uTask {
    const timedTaskLastTime: { [K: string]: number } = {};

    export const timedTask = (id: symbol, task: Function, timeout = 60000) => {
        const lastTime = timedTaskLastTime[id as any];
        const now = Date.now();
        if (!lastTime || now - lastTime > timeout) {
            timedTaskLastTime[id as any] = now;
            task();
        }
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
}

export const uTask: dp.DeepReadonly<typeof _uTask> = _uTask;
export default uTask;
