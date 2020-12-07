/**
 * @Creater cmZhou
 * @Desc 本地调试koa中间件
 */
import type Koa from 'koa';
import koaWebpack from 'koa-webpack';
import webpack from 'webpack';
import webpackHot from 'webpack-hot-middleware';

export default async <T extends Koa<any, any>>(koa: T, options: {
    webpackConfig: webpack.Configuration;
    publicPath: string;
}) => {
    const { webpackConfig, publicPath } = options;
    const compiler = webpack(webpackConfig);
    const hot = webpackHot(compiler);
    const hotMid: Koa.Middleware = (ctx, next) => hot(ctx.req, ctx.res, next);
    koa.use(await koaWebpack({ compiler, devMiddleware: { publicPath } }));
    koa.use(hotMid);
};
