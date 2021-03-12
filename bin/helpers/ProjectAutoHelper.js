/**
 * @Owners cmZhou
 * @Title 项目自动化构建助手
 */
const {
    printf,
    ColorsEnum,
} = require('../utils');

const {
    envs,
    runEnvArgs,
} = require('../../src/build/config');

class ProjectAutoHelper {
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
        const env = process.argv[4] || envs.production;

        if (envs[env]) return env;

        printf(`Error: please enter correct env (${Object.keys(envs).join(', ')})`, ColorsEnum.RED);
        process.exit(1);
    };

    getRunEnv = () => runEnvArgs[this.getEnv()];
}

module.exports = ProjectAutoHelper;
