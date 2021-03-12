/**
 * @Owners cmZhou
 * @Title build config
 */
// TODO 类型限制
const runEnvArgs = {
    production: 'production',
    exp: 'expProduction',

    test: 'test',
    dev: 'devTest',
    local: 'localTest',
};

const envValues = {
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
};

const NOW_RUN_ENV = process.env._CAIBIRD_RUN_ENV;

const isExpProduction = NOW_RUN_ENV === envValues.RUN_ENV.EXP_PRODUCTION; // 仅体验环境
const isProduction = NOW_RUN_ENV === envValues.RUN_ENV.PRODUCTION || isExpProduction; // 正式环境或体验环境

const isLocalTest = !NOW_RUN_ENV || NOW_RUN_ENV === envValues.RUN_ENV.LOCAL_TEST; // 仅本地调试
const isDevTest = NOW_RUN_ENV === envValues.RUN_ENV.DEV_TEST; // 仅开发环境
const isTest = NOW_RUN_ENV === envValues.RUN_ENV.TEST || isDevTest || isLocalTest; // 本地调试或开发环境或测试环境

module.exports = {
    envs: {
        production: 'production',
        exp: 'exp',

        test: 'test',
        dev: 'dev',
        local: 'local',
    },
    runEnvArgs,
    envTitles: {
        production: '【生产】环境',
        exp: '【体验】环境',

        test: '【测试】环境',
        dev: '【开发】环境',
        local: '【本地】环境',
    },
    envBranchs: {
        production: 'master',
        exp: 'exp',

        test: 'test',
        dev: 'dev',
        local: '',
    },

    envValues,

    runStatus: {
        isProduction,
        isExpProduction,

        isTest,
        isDevTest,
        isLocalTest,
    },
};
