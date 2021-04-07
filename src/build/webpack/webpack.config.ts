/**
 * @Owners cmZhou
 * @Title webpack base 文件
 */
import cssnano from 'cssnano';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import ScriptExtHtmlWebpackPlugin from 'script-ext-html-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import createTransformer, { Options as TsImportPluginOptions } from 'ts-import-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import getBabelrc from '../babel/babelrc';
import ini from '../ini';

import utils from './utils';

export type WebpackOptions = {
    projectName: string,
    projectTitle: string,
    outputConfig: {
        bundlePath: string,
        jsBundlePath: string,
        publicPath: string,
    },
    unionProjectNames?: string[],
    tsImportPluginConfig?: {
        useAntd?: boolean,
        transformerList?: TsImportPluginOptions[],
    },
    useMoment?: boolean,
    htmlWebpackPluginConfig: Omit<HtmlWebpackPlugin.Options, 'templateContent'> & {
        templateContent: string,
        disableScriptExtHtmlWebpackPlugin?: boolean,
    },
    devServerConfig?: {
        host: string,
        port: number,
    },
    addPlugins?(iniValues: typeof ini): webpack.Plugin[],
};

const { isProduction, isTest, isLocalTest } = ini;

const getProjectIncludeList = (projectList: string[], dirList: string[]) => {
    const pathList: string[] = [];
    projectList.forEach(name => {
        dirList.forEach(filename => {
            pathList.push(path.join(process.cwd(), `src/${name}/${filename}`));
        });
    });
    return pathList;
};

const getSplitChunks = (list: string[]) => {
    const splitChunks: { [key: string]: dCaibird.Obj } = {};
    list.forEach(item => {
        splitChunks[`async-vendor-${item}`] = {
            test: new RegExp(`/${item}/`),
            chunks: 'async',
            minSize: 100000,
            minChunks: 2,
            priority: 2,
            name: `async-vendor-${item}`,
        };
    });
    return splitChunks;
};

export default (webpackOptions: WebpackOptions, webpackConfig: webpack.Configuration = {}): webpack.Configuration => {
    const { projectName, projectTitle, unionProjectNames, outputConfig, tsImportPluginConfig, useMoment, htmlWebpackPluginConfig, addPlugins, devServerConfig } = webpackOptions;

    const tsConfig = path.join(process.cwd(), `src/${projectName}/tsconfig.webpack.json`);

    const getEntry = (): webpack.Configuration['entry'] => ({
        [utils.entryPointsNames.entry]: (isLocalTest ? [`webpack-dev-server/client?${devServerConfig ? `http://${devServerConfig.host}:${devServerConfig.port}` : ''}`] : []).concat(`./src/${projectName}/front/web/index`),
    });

    const getOutput = (): webpack.Output => ({
        path: path.join(process.cwd(), outputConfig.jsBundlePath),
        filename: `[name].bundle${utils.filenameBase}`,
        chunkFilename: `[name].chunk${utils.filenameBase}`,
        publicPath: `${outputConfig.publicPath}${outputConfig.publicPath.endsWith('/') ? '' : '/'}`,
        crossOriginLoading: 'anonymous',
    });

    const rules: webpack.Module['rules'] = [
        {
            test: /\.(tsx?|jsx?)$/,
            use: [{
                loader: 'babel-loader',
                options: {
                    babelrc: false,
                    ...getBabelrc({ projectName, target: 'webpack', unionProjectNames, useRequestApiReplace: true, projectVersion: CaibirdEnv.PROJECT_VERSION }),
                },
            }, {
                loader: 'ts-loader',
                options: {
                    configFile: tsConfig,
                    compilerOptions: {
                        sourceMap: !isProduction ? true : false,
                        inlineSourceMap: false,
                    },
                    getCustomTransformers: () => {
                        const list = tsImportPluginConfig?.transformerList || [];
                        if (tsImportPluginConfig?.useAntd) {
                            list.push({ style: isLocalTest ? 'css' : true });
                            list.push({
                                style: false,
                                libraryName: '@ant-design/icons',
                                libraryDirectory: undefined,
                                camel2DashComponentName: false,
                            });
                        }
                        return {
                            before: [createTransformer(list)],
                        };
                    },
                },
            }],
            include: [
                ...(getProjectIncludeList([projectName, ...(unionProjectNames || [])], ['front/@com', 'front/web', 'public', '_config.ts'])),
                path.join(process.cwd(), 'src/@scenes'),
                path.join(process.cwd(), 'src/@common/front/@com'),
                path.join(process.cwd(), 'src/@common/front/web'),
                path.join(process.cwd(), 'node_modules/caibird/src/public'),
                path.join(process.cwd(), 'node_modules/caibird/src/front/@com'),
                path.join(process.cwd(), 'node_modules/caibird/src/front/web'),
            ],
        },
        // 该段代码是为了让node_modules里的es6语法兼容低版本浏览器，本地调试为了提高启动速度默认不启用，如需启用请自行放开，但切勿提交
        ...(isLocalTest && !process.env._CAIBIRD_BABEL_TRANSFORM_ALL ? [] : [{
            test: /\.jsx?$/,
            use: [{
                loader: 'babel-loader',
                options: {
                    ...getBabelrc({ projectName, target: 'webpack', projectVersion: CaibirdEnv.PROJECT_VERSION }),
                    sourceType: 'unambiguous',
                },
            }],
            include: [
                path.join(process.cwd(), 'node_modules'),
            ],
            exclude: [
                path.join(process.cwd(), 'node_modules/caibird'),
            ],
        }]),
        isLocalTest ? {
            test: /\.css$/,
            use: [{
                loader: 'style-loader',
                options: {
                },
            }, {
                loader: 'css-loader',
                options: {
                    sourceMap: false,
                },
            },
            ],
        }
            : {
                test: /\.(less|css)$/,
                use: [
                    {
                        loader: 'style-loader',
                        options: {
                        },
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: false,
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: false,
                            postcssOptions: {
                                plugins: [
                                    cssnano(),
                                ],
                            },
                        },
                    },
                    {
                        loader: 'less-loader',
                        options: {
                            lessOptions: {
                                javascriptEnabled: true,
                            },
                            sourceMap: false,
                        },
                    },
                ],
            },
    ];

    const getPlugins = (): webpack.Plugin[] => {
        let plugins: webpack.Plugin[] = [];

        if (useMoment) {
            plugins.push(new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh-cn/));
        }

        if (isLocalTest) {
            plugins.push(new webpack.HotModuleReplacementPlugin());
        }

        plugins.push(new HtmlWebpackPlugin({
            title: projectTitle,
            filename: `${process.cwd()}${outputConfig.bundlePath}/index.html`,
            inject: 'body',
            ...htmlWebpackPluginConfig,
        }));

        if (!htmlWebpackPluginConfig.disableScriptExtHtmlWebpackPlugin) {
            plugins.push(new ScriptExtHtmlWebpackPlugin({
                custom: [{
                    test: /\.js$/,
                    attribute: 'crossorigin',
                    value: 'anonymous',
                }],
            }));
        }

        if (!isLocalTest) {
            plugins.push(
                new BundleAnalyzerPlugin({
                    reportFilename: '../.log/BundleAnalyzer.html',
                    generateStatsFile: true,
                    openAnalyzer: true,
                    analyzerMode: 'static',
                    statsFilename: '../.log/BundleAnalyzerStats.json',
                }),
            );
        }

        if (addPlugins) {
            plugins = plugins.concat(addPlugins(ini));
        }

        return plugins;
    };

    return {
        mode: isProduction ? 'production' : 'development',
        entry: getEntry(),
        output: getOutput(),
        module: {
            rules,
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx'],
            plugins: [
                new TsconfigPathsPlugin({
                    configFile: tsConfig,
                }),
            ],
            alias: isLocalTest ? {
                'react-dom': '@hot-loader/react-dom',
            } : {},
        },
        devtool: !isProduction ? 'cheap-module-source-map' : false,
        target: 'web',
        plugins: getPlugins(),
        stats: {
            colors: true,
        },
        optimization: {
            minimizer: [new TerserPlugin({
                terserOptions: {
                    keep_classnames: true,
                    keep_fnames: true,
                    output: {
                        comments: false,
                    },
                },
                extractComments: false,
            })],
            minimize: !isTest,
            splitChunks: {
                cacheGroups: {
                    // 处理入口chunk
                    [utils.entryPointsNames.vendor]: {
                        test: /[\\/]node_modules[\\/]/,
                        chunks: 'initial',
                        name: utils.entryPointsNames.vendor,
                    },
                    // 处理异步chunk
                    'async-vendor': {
                        test: /[\\/]node_modules[\\/]/,
                        chunks: 'async',
                        minChunks: 2,
                        priority: 1,
                        name: 'async-vendor',
                    },
                    ...getSplitChunks([]),
                },
            },
            runtimeChunk: {
                name: utils.entryPointsNames.runtime,
            },
        },
        ...webpackConfig,
    };
};
