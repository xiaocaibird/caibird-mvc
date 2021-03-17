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
        script: `require('./${projectName}/server').default()`,
        ext: 'js',
        watch: [`./dist/${projectName}/server`],
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
