/**
 * @Owners cmZhou
 * @Title 项目构建初始化文件
 */
import { runEnvArgs } from '../config';
namespace ini {
    export const envValues = {
        NODE_ENV: {
            PRODUCTION: 'production',
            DEVELOPMENT: 'development',
        },
        RUN_ENV: {
            PRODUCTION: runEnvArgs.production,
            EXP_PRODUCTION: runEnvArgs.exp,

            TEST: runEnvArgs.test,
            DEV_TEST: runEnvArgs.dev,
            LOCAL_TEST: runEnvArgs.local,
        },
    } as const;

    export const isExpProduction = process.env.RUN_ENV === envValues.RUN_ENV.EXP_PRODUCTION; // 仅体验环境
    export const isProduction = process.env.RUN_ENV === envValues.RUN_ENV.PRODUCTION || isExpProduction; // 正式环境或体验环境

    export const isLocalTest = !process.env.RUN_ENV || process.env.RUN_ENV === envValues.RUN_ENV.LOCAL_TEST; // 仅本地调试
    export const isDevTest = process.env.RUN_ENV === envValues.RUN_ENV.DEV_TEST; // 仅开发环境
    export const isTest = process.env.RUN_ENV === envValues.RUN_ENV.TEST || isDevTest || isLocalTest; // 本地调试或开发环境或测试环境

    export const NODE_ENV_VALUE = isProduction ? envValues.NODE_ENV.PRODUCTION : envValues.NODE_ENV.DEVELOPMENT;
}

export default ini as dp.DeepReadonly<typeof ini>;
