/**
 * @Owners cmZhou
 * @Title 本地调试
 */
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

import { uArray } from '../utils/uArray';

export type Options = {
    webpackConfig: webpack.Configuration,
    publicPath: string,

    watchIgnores?: webpack.Options.WatchOptions['ignored'],

    nodeServerConfig: {
        host: string,
        port: number,
    },

    webpackDevServerConfig?: WebpackDevServer.Configuration,
};

export default (options: Options) => {
    const { webpackConfig, publicPath, watchIgnores = [], nodeServerConfig, webpackDevServerConfig } = options;

    const serverOptions: WebpackDevServer.Configuration = {
        hot: true,
        transportMode: 'ws',
        compress: true,
        // clientLogLevel: 'none',
        inline: true,
        disableHostCheck: true,
        open: true,
        publicPath,
        host: nodeServerConfig.host,
        port: nodeServerConfig.port,
        // bonjour: true,
        // port: 3003,
        // contentBase: '',
        watchContentBase: true,
        contentBasePublicPath: publicPath,
        injectClient: false,
        // quiet: true,
        proxy: {
            '/**': {
                target: `http://${nodeServerConfig.host}:${nodeServerConfig.port}`,
                secure: false,
                changeOrigin: true,
                headers: {
                    Connection: 'keep-alive',
                },
            },
        },
        // progress: true,
        watchOptions: {
            ignored: [/node_modules\/(?!caibird-mvc)/, ...(uArray.check(watchIgnores) ? watchIgnores : [watchIgnores])],
            aggregateTimeout: 1000,
            poll: 1000,
        },

        ...webpackDevServerConfig,
    };

    WebpackDevServer.addDevServerEntrypoints(webpackConfig, serverOptions);
    const compiler = webpack(webpackConfig);

    const devServer = new WebpackDevServer(compiler, serverOptions);

    const port = nodeServerConfig.port + 1;
    devServer.listen(port, nodeServerConfig.host, err => {
        if (err) console.error(err, 'err');
        else console.log(`webpack run: http://${nodeServerConfig.host}:${port}`);
    });
};
