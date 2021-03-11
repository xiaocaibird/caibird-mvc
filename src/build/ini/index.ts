/**
 * @Owners cmZhou
 * @Title 项目构建初始化文件
 */
import { NODE_ENV, RUN_ENV } from '../config';
namespace ini {
    export const isExpProduction = process.env.RUN_ENV === RUN_ENV.EXP_PRODUCTION; // 仅体验环境
    export const isProduction = process.env.RUN_ENV === RUN_ENV.PRODUCTION || isExpProduction; // 正式环境或体验环境

    export const isLocalTest = !process.env.RUN_ENV || process.env.RUN_ENV === RUN_ENV.LOCAL_TEST; // 仅本地调试
    export const isDevTest = process.env.RUN_ENV === RUN_ENV.DEV_TEST; // 仅开发环境
    export const isTest = process.env.RUN_ENV === RUN_ENV.TEST || isDevTest || isLocalTest; // 本地调试或开发环境或测试环境

    export const NODE_ENV_VALUE = isProduction ? NODE_ENV.PRODUCTION : NODE_ENV.DEVELOPMENT; // TODO 对 process.env.NODE_ENV_VALUE 赋值
}

export default ini as dp.DeepReadonly<typeof ini>;
