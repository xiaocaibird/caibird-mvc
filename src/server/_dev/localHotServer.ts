/**
 * @Owners cmZhou
 * @Title 本地调试支热更新的服务
 */
import nodemon from 'nodemon';

import devWebpackServer, { Options } from './devWebpackServer';

const DEFAULT_DELAY = 1000;

export default (opt: {
    projectName: string,
    delay?: number,
    devWebpackServerOptions: Options,
}) => {
    const { projectName, delay, devWebpackServerOptions } = opt;

    nodemon({
        script: `./dist/${projectName}/server/index.js`,
        ext: 'js',
        watch: [
            './dist/@modules/caibird-mvc/src/public',
            './dist/@modules/caibird-mvc/src/server',

            './dist/@common/_config.js',
            './dist/@common/public',
            './dist/@common/server',

            `./dist/${projectName}/_config.js`,
            `./dist/${projectName}/public`,
            `./dist/${projectName}/server`,
        ],
        delay: delay ?? DEFAULT_DELAY,
        ignore: [
            'node_modules',
        ],
    });

    devWebpackServer(devWebpackServerOptions);

    nodemon.on('start', () => {
    }).on('quit', () => {
        process.exit();
    }).on('restart', files => {
        console.log('Server restarted due to: ', files);
    });
};
