/**
 * @Owners cmZhou
 * @Title 项目构建初始化文件
 */
namespace ini {
    // TODO 对 process.env.NODE_ENV_VALUE 赋值
    const PRO = 'production';
    const DEV = 'development';

    const envValue = {
        RUN_ENV: {
            PRODUCTION: PRO,
            EXP_PRODUCTION: 'expProduction',

            TEST: 'test',
            DEV: 'dev',
            LOCAL_TEST: 'localTest',
        },
    } as const;

    export const isExpProduction = process.env.RUN_ENV === envValue.RUN_ENV.EXP_PRODUCTION; // 仅体验环境
    export const isProduction = process.env.RUN_ENV === envValue.RUN_ENV.PRODUCTION || isExpProduction; // 正式环境或体验环境

    export const isLocalTest = !process.env.RUN_ENV || process.env.RUN_ENV === envValue.RUN_ENV.LOCAL_TEST; // 仅本地调试
    export const isDevTest = process.env.RUN_ENV === envValue.RUN_ENV.DEV; // 仅开发环境
    export const isTest = process.env.RUN_ENV === envValue.RUN_ENV.TEST || isDevTest || isLocalTest; // 本地调试或开发环境或测试环境

    export const NODE_ENV_VALUE = isProduction ? PRO : DEV;
}

export default ini as dp.DeepReadonly<typeof ini>;
