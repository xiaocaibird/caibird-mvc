/**
 * @Owners cmZhou
 * @Title base babel 配置
 */
import ini from '../ini';

import requestApiReplace from './plugins/requestApiReplace';
import FrontPathResolveTool from './utils/FrontPathResolveTool';

type Target = 'dist' | 'webpack';
type Platform = 'server' | 'taro' | 'web';
const platformsPathResolveDir: dCaibird.StrictObj<Platform, string[]> = {
    web: ['helpers', 'utils', 'consts', 'components'],
    taro: ['helpers', 'utils', 'consts', 'components', 'ui'], // TODO delete ui
    server: ['helpers', 'utils', 'consts', 'actions', 'filters'],
};

const platformsPathResolve: dCaibird.StrictObj<Platform, (dirName: string) => string> = {
    web: (dirName: string) => dirName === 'components' ? 'front/web/pages/@components' : `front/web/${dirName}`,
    taro: (dirName: string) =>
        dirName === 'components' ? 'front/taro/pages/@components' :
            dirName === 'ui' ? 'front/taro/pages/@components/@taro-ui' :
                `front/taro/${dirName}`,
    server: (dirName: string) =>
        dirName === 'actions' ?
            'server/controllers/@actions' :
            dirName === 'filters' ? 'server/controllers/@filters' :
                `server/${dirName}`,
};

export type BabelOptions = {
    target: Target,
    projectName: string,
    projectVersion: string,

    distPlatforms?: Platform[],
    unionProjectNames?: string[],
    useRequestApiReplace?: boolean,
};

export default (options: BabelOptions) => {
    const { NODE_ENV_VALUE, isProduction, isExpProduction, isTest, isDevTest, isLocalTest } = ini;
    const { target, projectName, unionProjectNames = [], distPlatforms = [], useRequestApiReplace, projectVersion } = options;

    const isWebpack = target === 'webpack';
    const isDist = target === 'dist';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plugins: any[] = [];

    useRequestApiReplace && plugins.push(requestApiReplace);

    const caibirdEnvs: dCaibird.CaibirdEnv = {
        RUN_ENV: process.env._CAIBIRD_RUN_ENV,

        PROJECT_NAME: projectName,

        PROJECT_VERSION: projectVersion,

        NODE_ENV_VALUE,

        HOST: process.env._CAIBIRD_HOST,
        PORT: parseInt(process.env._CAIBIRD_PORT),

        IS_PRODUCTION: isProduction, // 正式环境或体验环境
        IS_EXP_PRODUCTION: isExpProduction, // 仅体验环境

        IS_TEST: isTest, // 测试环境或开发环境或本地调试
        IS_DEV_TEST: isDevTest, // 仅开发环境
        IS_LOCAL_TEST: isLocalTest, // 仅本地调试
    };

    const defineCaibirdEnvs = Object.keys(caibirdEnvs).reduce<dCaibird.Obj>((obj, key) => {
        obj[`CaibirdEnv.${key}`] = caibirdEnvs[key as keyof typeof caibirdEnvs];
        return obj;
    }, {});

    const processEnvs: dCaibird.CustomProcessEnv = {
        _CAIBIRD_RUN_ENV: process.env._CAIBIRD_RUN_ENV,

        _CAIBIRD_BABEL_TRANSFORM_ALL: process.env._CAIBIRD_BABEL_TRANSFORM_ALL,

        _CAIBIRD_HOST: process.env._CAIBIRD_HOST,

        _CAIBIRD_PORT: process.env._CAIBIRD_PORT,

        _CAIBIRD_PROJECT_VERSION: process.env._CAIBIRD_PROJECT_VERSION,
    };

    const defineProcessEnvs = Object.keys(processEnvs).reduce<dCaibird.Obj>((obj, key) => {
        obj[`process.env.${key}`] = processEnvs[key as keyof typeof processEnvs];
        return obj;
    }, {});

    if (isWebpack) {
        defineProcessEnvs['process.env.NODE_ENV'] = NODE_ENV_VALUE;
    }

    plugins.push(['transform-define', { ...defineCaibirdEnvs, ...defineProcessEnvs }]);

    if (isWebpack) {
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

    if (isDist) {
        const alias: dCaibird.Obj<string> = {};

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
            cwd: `./.tsc/src/${projectName}/`,
            alias: {
                ...alias,
                'caibird/src': '../@modules/caibird/src',
                caibird: '../@modules/caibird/src',

                'caibird-projects-common-taro': '../@common/front/taro',
                'caibird-projects-common-web': '../@common/front/web',
                'caibird-projects-common-server': '../@common/server',

                'caibird-scenes-general-manage-sys-server': '../@scenes/general-manage-sys/server',
                'caibird-scenes-general-manage-sys-web': '../@scenes/general-manage-sys/front/web',
            },
        }]);

        plugins.push('minify-dead-code-elimination');
    }

    return {
        retainLines: isWebpack ? undefined : true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        presets: [['@babel/preset-env', { modules: false, targets: isWebpack ? { /* browsers: ['Chrome >= 60'] */ } : { node: '14' } }]] as any[],
        plugins,
    };
};
