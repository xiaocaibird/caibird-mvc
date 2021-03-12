/**
 * @Owners cmZhou
 * @Title build config
 */
module.exports = {
    runEnvArgs: {
        production: 'production',
        exp: 'expProduction',

        test: 'test',
        dev: 'devTest',
        local: 'localTest',
    },
    envKeys: {
        production: 'production',
        exp: 'exp',

        test: 'test',
        dev: 'dev',
        local: 'local',
    },
    envBranchs: {
        production: 'master',
        exp: 'exp',

        test: 'test',
        dev: 'dev',
    },
};
