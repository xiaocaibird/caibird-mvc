/**
 * @Owners cmZhou
 * @Title 项目自动化构建助手
 */
const {
    printf,
    exec,
    ColorsEnum,
} = require('../utils');

const {
    createDbEntityHelper,
    releaseHelper,
} = require('.');

const {
    nodeEnvValues,
    envValues,
    runEnvArgs,
} = require('../../src/build/config');

class ProjectAuto {
    constructor(opt) {
        const { projectsConfig = {} } = opt;

        this.projectsConfig = projectsConfig;

        this.allProjectNames = Object.keys(projectsConfig);

        this.hasServerProjectNames = Object.keys(projectsConfig).filter(projectName => !projectsConfig[projectName].noServer);

        this.hasGulpProjectNames = Object.keys(projectsConfig).filter(projectName => !projectsConfig[projectName].noGulp);

        this.hasWebpackProjectNames = Object.keys(projectsConfig).filter(projectName => !projectsConfig[projectName].noWebpack);

        this.taroProjectNames = Object.keys(projectsConfig).filter(projectName => projectsConfig[projectName].isTaro);

        this.allowReleaseProjectNames = Object.keys(projectsConfig).filter(projectName => !projectsConfig[projectName].noRelease);

        this.allowStartProjectNames = Object.keys(projectsConfig).filter(projectName => !projectsConfig[projectName].noStart);
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
        const env = process.argv[4] || envValues.production;

        if (envValues[env]) return env;

        printf(`Error: please enter correct env (${Object.keys(envValues).join(', ')})`, ColorsEnum.RED);
        process.exit(1);
    };

    getRunEnv = () => runEnvArgs[this.getEnv()];

    build = () => {
        const projectName = this.getProjectName();
        const env = this.getEnv();

        const result = exec(`npm run dist ${projectName} ${env} && npm run webpack ${projectName}`);
        process.exit(result.code);
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

        const result = exec(`rimraf assets/bundle && npm run check-tsc ${projectName} && cross-env _CAIBIRD_RUN_ENV=${runEnv} npm run gulp ${projectName}`);
        process.exit(result.code);
    };

    eslint = () => {
        const projectName = this.getProjectName();
        const unionProjectNames = this.getUnionProjectNames(projectName);

        const hasServer = this.hasServerProjectNames.includes(projectName);

        const result = exec(`eslint -c ./src/${projectName}/.eslintrc.json --cache --cache-location \"./.eslint/${projectName}-cache\" -f codeframe --ext .ts,.tsx,.js,.jsx ./src/${projectName} ${unionProjectNames.map(item => `./src/${item}`).join(' ')} ./src/@common ${hasServer ? './src/serverEntry.ts' : ''} ${process.argv.includes('fix') ? ' --fix' : ''}`);
        process.exit(result.code);
    };

    gulp = () => {
        const projectName = this.getProjectName();

        if (this.hasGulpProjectNames.includes(projectName)) {
            const result = exec(`rimraf dist && gulp dist --gulpfile .tsc/src/${projectName}/build/gulp/gulpfile.js`);
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

    start = () => {
        const projectName = this.getProjectName();
        const isReal = process.argv[4] === 'real-debug';

        if (this.allowStartProjectNames.includes(projectName)) {
            if (this.taroProjectNames.includes(projectName)) {
                const result = exec(`npm run check-tsc ${projectName} &&
                    cross-env NODE_ENV=${isReal ? nodeEnvValues.PRODUCTION : nodeEnvValues.DEVELOPMENT} node node_modules/caibird-mvc/bin/_/taro build --type weapp --watch ${projectName}`);
                process.exit(result.code);
            } else {
                const result = exec(`npm run kill-port && npm run dist ${projectName} ${envValues.local} && cross-env NODE_ENV=${nodeEnvValues.DEVELOPMENT} node app`);
                process.exit(result.code);
            }
        } else {
            printf(`Error: the project 【${projectName}】 no allow start`, ColorsEnum.RED);
            process.exit(1);
        }
    };

    tsc = () => {
        const projectName = this.getProjectName();

        const result = exec(`rimraf .tsc && tsc -p src/${projectName}/tsconfig.json`);
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
}

const allowCommands = ['build', 'checkTsc', 'createDbEntity', 'dist', 'eslint', 'gulp', 'release', 'start', 'tsc', 'webpack'];

const projectAutoHelper = (opt, getCommandOpts) => {
    const auto = new ProjectAuto(opt);

    const command = process.argv[3];

    const commandOpts = typeof getCommandOpts === 'function' ? getCommandOpts(auto) : getCommandOpts;

    if (allowCommands.includes(command)) {
        auto[command](commandOpts[command]);
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
