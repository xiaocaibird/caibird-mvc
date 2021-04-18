/**
 * @Owners cmZhou
 * @Title 将当前工程的依赖更新到最新版本
 */
const updatePackageHelper = require('./helpers/updatePackageHelper');

updatePackageHelper({
    packageJson: require('../package.json'),
    depLockList: [],
    devDepLockList: ['tapable', 'sequelize', 'webpack', 'webpack-cli', 'html-webpack-plugin', 'terser-webpack-plugin', '@types/terser-webpack-plugin', 'history', '@types/history'],
});
