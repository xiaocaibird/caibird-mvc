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
};

const NOW_RUN_ENV = process.env._CAIBIRD_RUN_ENV;

const isExpProduction = NOW_RUN_ENV === runEnvArgs.exp; // 仅体验环境
const isProduction = NOW_RUN_ENV === runEnvArgs.production || isExpProduction; // 正式环境或体验环境

const isLocalTest = !NOW_RUN_ENV || NOW_RUN_ENV === runEnvArgs.local; // 仅本地调试
const isDevTest = NOW_RUN_ENV === runEnvArgs.dev; // 仅开发环境
const isTest = NOW_RUN_ENV === runEnvArgs.test || isDevTest || isLocalTest; // 本地调试或开发环境或测试环境

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
