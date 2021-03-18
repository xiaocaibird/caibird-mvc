/**
 * @Owners cmZhou
 * @Title gulpfile 用于gulp任务的配置，项目构建的入口
 */
import fs from 'fs';
import gulp from 'gulp';
import babel from 'gulp-babel';
import gulpRename from 'gulp-rename';
import shelljs from 'shelljs';
import { v4 } from 'uuid';

import getBabelrc, { BabelOptions } from '../babel/babelrc';
import ini from '../ini';

const rootDir = './';

export default (babelOptions: Omit<BabelOptions, 'projectVersion'>) => {
    const projectVersion = v4().replace(/-/g, '');

    if (!fs.existsSync(`${rootDir}.log`)) {
        fs.mkdirSync(`${rootDir}.log`);
    }
    fs.writeFileSync(`${rootDir}.log/build.json`, JSON.stringify({ version: projectVersion }, null, 2));

    const babelrc = getBabelrc({
        ...babelOptions,
        projectVersion,
    });

    const projectList = fs.readdirSync(`${rootDir}.tsc/src`);

    const rootFileList = [
        'serverEntry.js',
    ];

    const fileList = [
        'build/babel',
        'build/ini',
        'build/webpack',
        'build/_config.js',

        'public',
        'server',
        'front',
        '_config.js',
    ];

    gulp.task('babel', async () => {
        projectList.forEach(projectName => {
            if (rootFileList.includes(projectName)) {
                gulp.src([`${rootDir}.tsc/src/${projectName}`])
                    .pipe(babel(babelrc))
                    .pipe(gulp.dest(`${rootDir}dist`));
            } else {
                fileList.forEach(file => {
                    if (file === 'build/_config.js' && projectName !== '@common') {
                        return;
                    }
                    if (file.endsWith('.js')) {
                        const lastIdx = file.lastIndexOf('/');
                        gulp.src([`${rootDir}.tsc/src/${projectName}/${file}`])
                            .pipe(babel(babelrc))
                            .pipe(gulp.dest(`${rootDir}dist/${projectName}${lastIdx >= 0 ? `/${file.slice(0, lastIdx)}` : ''}`));
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

        return Promise.resolve();
    });

    gulp.task('last', async () => {
        if (ini.isLocalTest) {
            shelljs.exec(`start cmd /k cross-env NODE_ENV=${ini.NODE_ENV_VALUE} node ${rootDir}app`, {
                async: true,
                env: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ...(process.env as any),
                    FORCE_COLOR: true,
                },
            });

            const watcher = gulp.watch([`${rootDir}.tsc/src/${babelOptions.projectName}/server/**/*.js`], done => {
                done();
            });
            watcher.on('change', (path, _stats) => {
                const toPath = path.replace('.tsc\\src\\', 'dist\\');
                const lastIdx = toPath.lastIndexOf('\\');
                gulp.src([path])
                    .pipe(babel(babelrc))
                    .pipe(gulpRename({ dirname: '' }))
                    .pipe(gulp.dest(toPath.slice(0, lastIdx)));
            });
        }
        return Promise.resolve();
    });

    gulp.task('dist', gulp.series('babel', 'last'));
};
