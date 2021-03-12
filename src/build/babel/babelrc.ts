/**
 * @Owners cmZhou
 * @Title base babel 配置
 */
import ini from '../ini';

import requestApiReplace from './plugins/requestApiReplace';
import FrontPathResolveTool from './utils/FrontPathResolveTool';

type Platform = 'server' | 'web'; // | 'taro';

const platformsPathResolveDir: dp.StrictObj<Platform, string[]> = {
    web: ['helpers', 'utils', 'consts', 'components'],
    server: ['helpers', 'utils', 'consts'],
};

const platformsPathResolve: dp.StrictObj<Platform, (dirName: string) => string> = {
    web: (dirName: string) => dirName === 'components' ? 'front/web/pages/@components' : `front/web/${dirName}`,
    server: (dirName: string) => `server/${dirName}`,
};

export type BabelOptions = {
    runPlatform: Platform,
    projectName: string,
    projectVersion: string,

    distPlatforms?: Platform[],
    unionProjectNames?: string[],
    useRequestApiReplace?: boolean,
};

export default (options: BabelOptions) => {
    const { NODE_ENV_VALUE, isProduction, isExpProduction, isTest, isDevTest, isLocalTest } = ini;
    const { runPlatform, projectName, unionProjectNames = [], distPlatforms = [], useRequestApiReplace, projectVersion } = options;

    const isWeb = runPlatform === 'web';
    const isServer = runPlatform === 'server';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plugins: any[] = [];

    useRequestApiReplace && plugins.push(requestApiReplace);

    const env: dp.CaibirdEnv = {
        RUN_ENV: process.env._CAIBIRD_RUN_ENV,

        PROJECT_NAME: projectName,

        PROJECT_VERSION: projectVersion,

        NODE_ENV_VALUE,

        IS_PRODUCTION: isProduction, // 正式环境或体验环境
        IS_EXP_PRODUCTION: isExpProduction, // 仅体验环境

        IS_TEST: isTest, // 测试环境或开发环境或本地调试
        IS_DEV_TEST: isDevTest, // 仅开发环境
        IS_LOCAL_TEST: isLocalTest, // 仅本地调试
    };

    const defineEnv = Object.keys(env).reduce<dp.Obj>((obj, key) => {
        obj[`CaibirdEnv.${key}`] = env[key as keyof typeof env];
        return obj;
    }, {});

    if (isWeb) {
        defineEnv['process.env.NODE_ENV'] = NODE_ENV_VALUE;
    }

    plugins.push(['transform-define', defineEnv]);

    if (isWeb) {
        plugins.push('@babel/plugin-syntax-dynamic-import');

        const importPluginTool = new FrontPathResolveTool({
            platform: 'web',
        });
        platformsPathResolveDir.web.forEach(dirName => {
            plugins.push(importPluginTool.getImportBabelPlugin(projectName, dirName));

            unionProjectNames.forEach(dependentProjectName => {
                plugins.push(importPluginTool.getImportBabelPlugin(dependentProjectName, dirName));
            });
        });

        plugins.push('@babel/plugin-transform-runtime');
        if (isLocalTest) {
            plugins.push('react-hot-loader/babel');
        }
    }

    if (isServer) {
        const alias: dp.Obj<string> = {};

        const setAlias = (platform: Platform, dirName: string, dependentProjectName?: string) => {
            const key = `${dependentProjectName ? dependentProjectName : projectName}-${platform}-${dirName}`;
            alias[key] = `${dependentProjectName ? '..' : '.'}/${platformsPathResolve[platform](dirName)}`;
        };

        distPlatforms.forEach(pf => {
            platformsPathResolveDir[pf].forEach(dirName => {
                setAlias(pf, dirName);

                unionProjectNames.forEach(dependentProjectName => {
                    setAlias(pf, dirName, dependentProjectName);
                });
            });
        });

        plugins.push(['module-resolver', {
            cwd: '../../',
            alias: {
                ...alias,
                'caibird-mvc': '../@modules/caibird-mvc/src',
            },
        }]);

        plugins.push('minify-dead-code-elimination');
    }

    return {
        retainLines: isWeb ? undefined : true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        presets: [['@babel/preset-env', { modules: false, targets: isWeb ? { /* browsers: ['Chrome >= 60'] */ } : { node: '14' } }]] as any[],
        plugins,
    };
};
