/**
 * @Owners cmZhou
 * @Title gulpfile 用于gulp任务的配置，项目构建的入口
 */
import fs from 'fs';
import gulp from 'gulp';
import babel from 'gulp-babel';
import gulpRename from 'gulp-rename';
import { v4 } from 'uuid';

import getBabelrc, { BabelOptions } from '../babel/babelrc';
import ini from '../ini';

const rootDir = './';

export default (babelOptions: Omit<BabelOptions, 'projectVersion'>) => {
    const projectVersion = process.env._CAIBIRD_PROJECT_VERSION || v4().replace(/-/g, '');

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

        'public',
        'server',
        'front',
        '_config.js',
    ];

    gulp.task('dist', async () => {
        projectList.forEach(projectName => {
            if (rootFileList.includes(projectName)) {
                gulp.src([`${rootDir}.tsc/src/${projectName}`])
                    .pipe(babel(babelrc))
                    .pipe(gulp.dest(`${rootDir}dist`));
            } else {
                fileList.forEach(file => {
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

                if (projectName !== '@common') {
                    // TODO caibird taro
                    if (fs.existsSync(`${rootDir}src/${projectName}/front/taro/project.config.json`)) {
                        gulp.src([`${rootDir}src/${projectName}/front/taro/project.config.json`])
                            .pipe(gulpRename({ dirname: '' }))
                            .pipe(gulp.dest(`${rootDir}dist/${projectName}/front/taro`));

                        gulp.src([`${rootDir}src/${projectName}/front/taro/**/*.scss`])
                            .pipe(gulp.dest(`${rootDir}dist/${projectName}/front/taro`));

                        gulp.src([`${rootDir}src/${projectName}/front/taro/assets/**`])
                            .pipe(gulp.dest(`${rootDir}dist/${projectName}/front/taro/assets`));

                        gulp.src([
                            `${rootDir}src/${projectName}/front/taro/wx-plugins/**/*.json`,
                            `${rootDir}src/${projectName}/front/taro/wx-plugins/**/*.wxml`,
                            `${rootDir}src/${projectName}/front/taro/wx-plugins/**/*.wxss`,
                        ])
                            .pipe(gulp.dest(`${rootDir}dist/${projectName}/front/taro/wx-plugins`));
                    }
                } else {
                    gulp.src([`${rootDir}src/${projectName}/front/taro/**/*.scss`])
                        .pipe(gulp.dest(`${rootDir}dist/${projectName}/front/taro`));
                }
            }
        });

        const nodeModulesFiles = [`${rootDir}.tsc/node_modules/**/*.js`];
        gulp.src(nodeModulesFiles)
            .pipe(babel(babelrc))
            .pipe(gulp.dest(`${rootDir}dist/@modules`));

        return Promise.resolve();
    });

    gulp.task('watch', async () => {
        if (ini.isLocalTest) {
            let isDone = false;
            const watcher = gulp.watch([
                `${rootDir}.tsc/node_modules/caibird/src/server/**/*.js`,
                `${rootDir}.tsc/node_modules/caibird/src/front/taro/**/*.js`,
                `${rootDir}.tsc/node_modules/caibird/src/public/**/*.js`,

                `${rootDir}.tsc/src/@common/_config.js`,
                `${rootDir}.tsc/src/@common/server/**/*.js`,
                `${rootDir}.tsc/src/@common/front/taro/**/*.js`,
                `${rootDir}.tsc/src/@common/public/**/*.js`,

                `${rootDir}.tsc/src/${babelOptions.projectName}/_config.js`,
                `${rootDir}.tsc/src/${babelOptions.projectName}/server/**/*.js`,
                `${rootDir}.tsc/src/${babelOptions.projectName}/front/taro/**/*.js`,
                `${rootDir}.tsc/src/${babelOptions.projectName}/public/**/*.js`,

                // `${rootDir}src/${babelOptions.projectName}/front/taro/project.config.json`,
                // `${rootDir}src/${babelOptions.projectName}/front/taro/**/*.scss`,
                // `${rootDir}src/${babelOptions.projectName}/front/taro/assets/**`,
                // `${rootDir}src/${babelOptions.projectName}/front/taro/wx-plugins/**/*.json`,
                // `${rootDir}src/${babelOptions.projectName}/front/taro/wx-plugins/**/*.wxml`,
                // `${rootDir}src/${babelOptions.projectName}/front/taro/wx-plugins/**/*.wxss`,
                // `${rootDir}src/@common/front/taro/**/*.scss`

                `${rootDir}src/${babelOptions.projectName}/front/taro/**`,
                `${rootDir}src/@common/front/taro/**`,
            ], done => {
                done();
                setTimeout(() => {
                    isDone = true;
                }, eDate.MsCount.TenSec);
            });

            const func = (type: 'add' | 'change' | 'delete') => (path: string) => {
                try {
                    if (path.startsWith('src') &&
                        (path.endsWith('.ts') || path.endsWith('.tsx') || path.endsWith('.js') || path.endsWith('.jsx'))
                    ) {
                        return;
                    }

                    const toPath = path
                        .replace(/\\/g, '/')
                        .replace(/^.tsc\/node_modules\//, 'dist/@modules/')
                        .replace(/^.tsc\/src\//, 'dist/')
                        .replace(/^src\//, 'dist/');

                    const lastIdx = toPath.lastIndexOf('/');

                    isDone && console.log(`watch ${type}:`, `${path} => ${toPath}`);

                    if (type === 'delete') {
                        fs.unlinkSync(toPath);
                    } else {
                        if (path.endsWith('.js')) {
                            gulp.src([path])
                                .pipe(babel(babelrc))
                                .pipe(gulpRename({ dirname: '' }))
                                .pipe(gulp.dest(toPath.slice(0, lastIdx)));
                        } else {
                            gulp.src([path])
                                .pipe(gulpRename({ dirname: '' }))
                                .pipe(gulp.dest(toPath.slice(0, lastIdx)));
                        }
                    }
                } catch (e: unknown) {
                    console.error('gulp watch callback error:', e);
                }
            };

            watcher.on('change', func('change'));
            watcher.on('add', func('add'));
            // watcher.on('unlink', func('delete'));
            watcher.on('error', err => console.log('watch error', err));
        }
        return Promise.resolve();
    });
};
