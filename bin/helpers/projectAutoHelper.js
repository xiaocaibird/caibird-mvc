/**
 * @Owners cmZhou
 * @Title 项目自动化构建助手
 */
const path = require('path');
const { v4 } = require('uuid');

const {
    printf,
    exec,
    ColorsEnum,
} = require('../utils');

const createDbEntityHelper = require('./createDbEntityHelper');
const releaseHelper = require('./releaseHelper');

const {
    nodeEnvValues,
    envValues,
    runEnvArgs,
} = require('../../src/build/_config');

class ProjectAuto {
    constructor(opt) {
        const { projectsConfig = {} } = opt;

        this.projectsConfig = projectsConfig;

        this.allProjectNames = Object.keys(projectsConfig);

        this.hasServerProjectNames = Object.keys(projectsConfig).filter(projectName => !projectsConfig[projectName].props.noServer);

        this.hasGulpProjectNames = Object.keys(projectsConfig).filter(projectName => !projectsConfig[projectName].props.noGulp);

        this.hasWebpackProjectNames = Object.keys(projectsConfig).filter(projectName => !projectsConfig[projectName].props.noWebpack);

        this.taroProjectNames = Object.keys(projectsConfig).filter(projectName => projectsConfig[projectName].props.isTaro);

        this.allowReleaseProjectNames = Object.keys(projectsConfig).filter(projectName => !projectsConfig[projectName].props.noRelease);

        this.allowStartProjectNames = Object.keys(projectsConfig).filter(projectName => !projectsConfig[projectName].props.noStart);
    }

    getUnionProjectNames = pName => this.projectsConfig[pName] && this.projectsConfig[pName].unionProjectNames || [];

    getProjectName = () => {
        const projectName = process.argv[3] || '';
        if (this.allProjectNames.includes(projectName)) return projectName;

        if (projectName) {
            printf(`Error: No Found project 【${projectName}】`, ColorsEnum.RED);
        } else {
            printf('Error: please enter projectName', ColorsEnum.RED);
        }
        process.exit(1);
    };

    getEnv = () => {
        const env = process.argv[4] || envValues.local;

        if (envValues[env]) return env;

        printf(`Error: please enter correct env (${Object.keys(envValues).join(', ')})`, ColorsEnum.RED);
        process.exit(1);
    };

    getRunEnv = () => runEnvArgs[this.getEnv()];

    getStartConfig = () => {
        let startConfig = {};
        const runEnv = this.getRunEnv();

        try {
            startConfig = require(
                path.relative(__dirname,
                    path.join(process.cwd(), '/.local/startConfig')));

            startConfig = startConfig ?? {};
        } catch { }

        const localPort = 3000;
        const releasePort = 8080;

        const host = runEnv === runEnvArgs.local ? (startConfig.host || 'localhost') : '0.0.0.0';
        const port = runEnv === runEnvArgs.local ? (startConfig.port ?? localPort) : releasePort;

        return {
            ...startConfig,
            host,
            port,
        };
    };

    build = () => {
        const projectName = this.getProjectName();
        const env = this.getEnv();
        const allowWebpack = this.hasWebpackProjectNames.includes(projectName);
        const isTaro = this.taroProjectNames.includes(projectName);

        const result = exec(`npm run dist ${projectName} ${env}
                            ${allowWebpack ? `&& npm run webpack ${projectName}` : ''}
                            ${isTaro ? `&& npm run build-taro ${projectName}` : ''}`);
        process.exit(result.code);
    };

    buildTaro = () => {
        const projectName = this.getProjectName();

        if (this.taroProjectNames.includes(projectName)) {
            const result = exec(`rimraf .taro && cross-env NODE_ENV=${nodeEnvValues.PRODUCTION} node node_modules/caibird/bin/_/taro build --type weapp ${projectName}`);
            process.exit(result.code);
        } else {
            printf(`Error: the project 【${projectName}】 no has taro`, ColorsEnum.RED);
            process.exit(1);
        }
    };

    checkTsc = () => {
        const projectName = this.getProjectName();

        const result = exec(`npm run eslint ${projectName} && npm run tsc ${projectName}`);
        process.exit(result.code);
    };

    createDbEntity = () => {
        const projectName = this.getProjectName();

        if (this.hasServerProjectNames.includes(projectName)) {
            createDbEntityHelper(`src/${projectName}/server/models`);
        } else {
            printf(`Error: the project 【${projectName}】 no has server`, ColorsEnum.RED);
            process.exit(1);
        }
    };

    dist = () => {
        const projectName = this.getProjectName();
        const runEnv = this.getRunEnv();
        const startConfig = this.getStartConfig();

        const result = exec(`rimraf assets/bundle &&
                             npm run check-tsc ${projectName} &&
                             cross-env _CAIBIRD_RUN_ENV=${runEnv} _CAIBIRD_HOST=${startConfig.host} _CAIBIRD_PORT=${startConfig.port} npm run gulp:dist ${projectName}`);

        process.exit(result.code);
    };

    eslint = () => {
        const projectName = this.getProjectName();
        const unionProjectNames = this.getUnionProjectNames(projectName);

        const hasServer = this.hasServerProjectNames.includes(projectName);
        const isTaro = this.taroProjectNames.includes(projectName);

        const result = exec(`eslint -c ./src/${projectName}/.eslintrc.json --cache --cache-location \"./.eslint/${projectName}-cache\" -f codeframe --ext .ts,.tsx,.js,.jsx ./src/${projectName} ${unionProjectNames
            .map(item => `./src/${item}`).join(' ')} ./src/@common/build ./src/@common/server ./src/@common/front/@com ${isTaro ? './src/@common/front/taro' : './src/@common/front/web'} ${hasServer ? './src/serverEntry.ts' : ''} ${process.argv.includes('fix') ? ' --fix' : ''}`);
        process.exit(result.code);
    };

    gulpDist = () => {
        const projectName = this.getProjectName();

        if (this.hasGulpProjectNames.includes(projectName)) {
            const result = exec(`rimraf dist && gulp dist --gulpfile .tsc/src/${projectName}/build/gulp/gulpfile.js --cwd ./`);
            process.exit(result.code);
        } else {
            printf(`Error: the project 【${projectName}】 no has gulpfile`, ColorsEnum.RED);
            process.exit(1);
        }
    };

    gulpWatch = () => {
        const projectName = this.getProjectName();

        if (this.hasGulpProjectNames.includes(projectName)) {
            const result = exec(`rimraf .local/dist/rubbish && gulp watch --gulpfile .tsc/src/${projectName}/build/gulp/gulpfile.js --cwd ./`);
            process.exit(result.code);
        } else {
            printf(`Error: the project 【${projectName}】 no has gulpfile`, ColorsEnum.RED);
            process.exit(1);
        }
    };

    release = opt => {
        const projectName = this.getProjectName();
        const env = this.getEnv();

        if (this.allowReleaseProjectNames.includes(projectName)) {
            releaseHelper({
                projectName,
                env,
                ...opt,
            });
        } else {
            printf(`Error: the project 【${projectName}】 no allow release`, ColorsEnum.RED);
            process.exit(1);
        }
    };

    startTaro = () => {
        const projectName = this.getProjectName();

        if (this.taroProjectNames.includes(projectName)) {
            const isReal = process.argv[4] === 'real-debug';
            const nodeEnv = isReal ? nodeEnvValues.PRODUCTION : nodeEnvValues.DEVELOPMENT;

            const result = exec(`rimraf .taro && cross-env NODE_ENV=${nodeEnv} node node_modules/caibird/bin/_/taro build --type weapp --watch ${projectName}`);
            process.exit(result.code);
        } else {
            printf(`Error: the project 【${projectName}】 no has taro`, ColorsEnum.RED);
            process.exit(1);
        }
    };

    startWatch = () => {
        const projectName = this.getProjectName();

        const allowWebpack = this.hasWebpackProjectNames.includes(projectName);
        const allowServer = this.hasServerProjectNames.includes(projectName);
        const startConfig = this.getStartConfig();

        const gulpCommandPrefix = `cross-env _CAIBIRD_RUN_ENV=${runEnvArgs.local} _CAIBIRD_HOST=${startConfig.host} _CAIBIRD_PORT=${startConfig.port}`;

        const result = exec(
            `kill-port ${startConfig.port} &&
            concurrently -n "${allowServer ? 'node,' : ''}${allowWebpack ? 'webpack,' : ''}gulp,tsc" -c "${allowServer ? 'cyan.bold,' : ''}${allowWebpack ? 'yellow.bold,' : ''}green.bold,magenta.bold"
            ${allowServer ? `"cross-env NODE_ENV=${nodeEnvValues.DEVELOPMENT} node app"` : ''}
            ${allowWebpack ? `"npm run webpack-dev-server ${projectName}"` : ''}
            "${gulpCommandPrefix} npm run gulp:watch ${projectName}"
            "tsc -w -p src/${projectName}/tsconfig.json"`,
        );
        process.exit(result.code);
    };

    start = () => {
        const projectName = this.getProjectName();

        const projectVersion = v4().replace(/-/g, '');

        if (this.allowStartProjectNames.includes(projectName)) {
            if (this.taroProjectNames.includes(projectName)) {
                const result = exec(
                    `cross-env _CAIBIRD_PROJECT_VERSION=${projectVersion} npm run dist ${projectName} ${envValues.local} &&
                         concurrently -p "【{name}】" -n "WATCH,TARO" "cross-env _CAIBIRD_PROJECT_VERSION=${projectVersion} npm run start-watch ${projectName}" "npm run start-taro ${projectName}"`,
                );
                process.exit(result.code);
            } else {
                const result = exec(`cross-env _CAIBIRD_PROJECT_VERSION=${projectVersion} npm run dist ${projectName} ${envValues.local} && cross-env _CAIBIRD_PROJECT_VERSION=${projectVersion} npm run start-watch ${projectName}`);
                process.exit(result.code);
            }
        } else {
            printf(`Error: the project 【${projectName}】 no allow start`, ColorsEnum.RED);
            process.exit(1);
        }
    };

    tsc = () => {
        const projectName = this.getProjectName();

        const result = exec(`rimraf .tsc && tsc -v && tsc -p src/${projectName}/tsconfig.json`);
        process.exit(result.code);
    };

    webpack = () => {
        const projectName = this.getProjectName();

        if (this.hasWebpackProjectNames.includes(projectName)) {
            const result = exec(`rimraf assets/bundle && webpack --config dist/${projectName}/build/webpack/webpack.config`);
            process.exit(result.code);
        } else {
            printf(`Error: the project 【${projectName}】 no has webpack`, ColorsEnum.RED);
            process.exit(1);
        }
    };

    webpackDevServer = () => {
        const projectName = this.getProjectName();

        if (this.hasWebpackProjectNames.includes(projectName)) {
            try {
                require(
                    path.relative(__dirname,
                        path.join(process.cwd(), `/dist/${projectName}/build/webpack/webpackDevServer`))).default();
            } catch (e) {
                printf(`Error: ${e?.message || 'webpackDevServer 启动失败！！！'}`, ColorsEnum.RED);
                process.exit(1);
            }
        } else {
            printf(`Error: the project 【${projectName}】 no has webpack`, ColorsEnum.RED);
            process.exit(1);
        }
    };
}

const allowCommands = ['build', 'checkTsc', 'createDbEntity', 'dist', 'eslint', 'startTaro', 'buildTaro',
    'gulpDist', 'gulpWatch', 'release', 'start', 'startWatch', 'tsc', 'webpack', 'webpackDevServer'];

const projectAutoHelper = (opt, commandOpts) => {
    const auto = new ProjectAuto(opt);
    const command = process.argv[2];

    if (allowCommands.includes(command)) {
        let commandOpt = commandOpts[command];
        commandOpt = typeof commandOpt === 'function' ? commandOpt(auto) : commandOpt;
        auto[command](commandOpt);
    } else {
        if (command) {
            printf(`Error: the command 【${command}】 is incorrect`, ColorsEnum.RED);
        } else {
            printf('Error: please enter command', ColorsEnum.RED);
        }
        process.exit(1);
    }
};

module.exports = projectAutoHelper;
