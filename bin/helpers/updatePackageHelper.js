/**
 * @Creater cmZhou
 * @Desc 把输入的依赖更新到最新版本
 */
const {
    execStdout
} = require('../utils');

const getVersionCode = versionStr => versionStr.trim().indexOf('^') === 0 ? versionStr.slice(1) : versionStr;

// npm install [option] ...
// or
// yarn workspaces name add [option] ...
const getCommandString = (npmClient, dev, content, workspaceName) => {
    let command = npmClient === 'npm' ? 'install' : 'add';
    const options = dev ? '-D' : (npmClient === 'npm' ? '--save' : '');
    if (workspaceName) {
        command = command + ` workspaces ${workspaceName}`;
    }
    return `${npmClient} ${command} ${options} ${content}`;
};

const update = ({
    ignore,
    npmClient,
    workspaceName,
    packageJson,
    depLockList,
    devDepLockList
}) => {
    const ignoreList = ignore || [];
    const npmClient = npmClient || 'npm';

    // 锁版本的list
    let lockList = depLockList || [];
    // 更新dependencies
    const dependencies = packageJson.dependencies;
    let packList = Object.keys(dependencies).filter(item => !lockList.includes(item)).filter(item => !ignoreList.includes(item));

    let latestStr = packList.length ? `${packList.join('@latest ')}@latest` : '';
    let lockStr = lockList.map(item => dependencies[item] ? `${item}@${getVersionCode(dependencies[item])}` : '').filter(item => !!item).join(' ');

    packList.length && execStdout(getCommandString(npmClient, false, `${latestStr} ${lockStr}`, workspaceName));

    lockList = devDepLockList || [];
    // 更新devDependencies
    const devDependencies = packageJson.devDependencies;
    packList = Object.keys(devDependencies).filter(item => !lockList.includes(item)).filter(item => !ignoreList.includes(item));

    latestStr = packList.length ? `${packList.join('@latest ')}@latest` : '';
    lockStr = lockList.map(item => devDependencies[item] ? `${item}@${getVersionCode(devDependencies[item])}` : '').filter(item => !!item).join(' ');

    packList.length && execStdout(getCommandString(npmClient, true, `${latestStr} ${lockStr}`, workspaceName));
};

module.exports = update;
