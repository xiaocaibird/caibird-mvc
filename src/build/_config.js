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

const nodeEnvValues = {
    PRODUCTION: 'production',
    DEVELOPMENT: 'development',
};

module.exports = {
    envValues: {
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

    nodeEnvValues,
};
