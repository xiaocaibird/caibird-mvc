/**
 * @Creater cmZhou
 * @Desc async 常用枚举
 */
declare namespace eAsync {
    namespace F {
        const enum Action {
            Break = 0, // 中断其它
            Hide = 1, // 隐藏其它
            Parallel = 2  // 并行
        }
        const enum Status {
            BeBreaked = 0, BeHided = 1, Running = 2
        }
    }
}
