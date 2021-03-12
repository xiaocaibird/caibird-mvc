/**
 * @Owners cmZhou
 * @Title gulpfile 用于gulp任务的配置，项目构建的入口
 */
import fs from 'fs';
import gulp from 'gulp';
import babel from 'gulp-babel';
import { v4 } from 'uuid';

import getBabelrc, { BabelOptions } from '../babel/babelrc';

const rootDir = '../../../../../';

export default (babelOptions: BabelOptions) => {
    process.env.PROJECT_VERSION = v4().replace(/-/g, '');

    if (!fs.existsSync(`${rootDir}.log`)) {
        fs.mkdirSync(`${rootDir}.log`);
    }
    fs.writeFileSync(`${rootDir}.log/build.json`, JSON.stringify({ version: process.env.PROJECT_VERSION }, null, 2));

    const babelrc = getBabelrc(babelOptions);

    const projectList = fs.readdirSync(`${rootDir}.tsc/src`);

    const rootFileList = [
        'serverEntry.js',
    ];

    const fileList = [
        'build/babel',
        'build/ini',
        'build/webpack',

        'public',
        'server',
        'front',

        'config.js',
    ];

    gulp.task('dist', () => {
        projectList.forEach(projectName => {
            if (rootFileList.includes(projectName)) {
                gulp.src([`${rootDir}.tsc/src/${projectName}`])
                    .pipe(babel(babelrc))
                    .pipe(gulp.dest(`${rootDir}dist`));
            } else {
                fileList.forEach(file => {
                    if (file.endsWith('.js')) {
                        gulp.src([`${rootDir}.tsc/src/${projectName}/${file}`])
                            .pipe(babel(babelrc))
                            .pipe(gulp.dest(`${rootDir}dist/${projectName}`));
                    } else {
                        gulp.src([`${rootDir}.tsc/src/${projectName}/${file}/**/*.js`])
                            .pipe(babel(babelrc))
                            .pipe(gulp.dest(`${rootDir}dist/${projectName}/${file}`));
                    }
                });
            }
        });

        const nodeModulesFiles = [`${rootDir}.tsc/node_modules/**/*.js`];
        gulp.src(nodeModulesFiles)
            .pipe(babel(babelrc))
            .pipe(gulp.dest(`${rootDir}dist/@modules`));
    });
};