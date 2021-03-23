/**
 * @Owners cmZhou
 * @Title 项目构建初始化文件
 */
// eslint-disable-next-line no-restricted-imports
import config from '../_config';

const { nodeEnvValues, runEnvArgs } = config;
namespace _ini {
    const NOW_RUN_ENV = process.env._CAIBIRD_RUN_ENV;

    export const isExpProduction = NOW_RUN_ENV === runEnvArgs.exp; // 仅体验环境
    export const isProduction = NOW_RUN_ENV === runEnvArgs.production || isExpProduction; // 正式环境或体验环境

    export const isLocalTest = !NOW_RUN_ENV || NOW_RUN_ENV === runEnvArgs.local; // 仅本地调试
    export const isDevTest = NOW_RUN_ENV === runEnvArgs.dev; // 仅开发环境
    export const isTest = NOW_RUN_ENV === runEnvArgs.test || isDevTest || isLocalTest; // 本地调试或开发环境或测试环境

    export const NODE_ENV_VALUE = isProduction ? nodeEnvValues.PRODUCTION : nodeEnvValues.DEVELOPMENT;
}

const ini: dp.DeepReadonly<typeof _ini> = _ini;

export default ini;
