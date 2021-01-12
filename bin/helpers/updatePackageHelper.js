/**
 * @Creater cmZhou
 * @Desc 把输入的依赖更新到最新版本
 */
const {
    exec
} = require('../utils');

const getVersionCode = versionStr => versionStr.trim().indexOf('^') === 0 ? versionStr.slice(1) : versionStr;

const update = ({
    ignore,
    packageJson,
    depLockList,
    devDepLockList
}) => {
    const ignoreList = ignore || [];

    // 锁版本的list
    let lockList = depLockList || [];
    // 更新dependencies
    const dependencies = packageJson.dependencies;
    let packList = Object.keys(dependencies).filter(item => !lockList.includes(item)).filter(item => !ignoreList.includes(item));

    let latestStr = packList.length ? `${packList.join('@latest ')}@latest` : '';
    let lockStr = lockList.map(item => dependencies[item] ? `${item}@${getVersionCode(dependencies[item])}` : '').filter(item => !!item).join(' ');

    packList.length && exec(`npm i --save ${latestStr} ${lockStr}`);

    lockList = devDepLockList || [];
    // 更新devDependencies
    const devDependencies = packageJson.devDependencies;
    packList = Object.keys(devDependencies).filter(item => !lockList.includes(item)).filter(item => !ignoreList.includes(item));

    latestStr = packList.length ? `${packList.join('@latest ')}@latest` : '';
    lockStr = lockList.map(item => devDependencies[item] ? `${item}@${getVersionCode(devDependencies[item])}` : '').filter(item => !!item).join(' ');

    packList.length && exec(`npm i --save-dev ${latestStr} ${lockStr}`);
};

module.exports = update;
