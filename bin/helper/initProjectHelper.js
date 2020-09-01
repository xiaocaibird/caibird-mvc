/**
 * @Creater cmZhou
 * @Desc 安装一些工程必备的依赖
 */
const {
    exec,
    printf,
    ColorsEnum
} = require('../util');

const defaultGlobalList = ['sequelize-auto-xiaocaibird-fork', 'kill-port', 'cross-env', 'shx'];

module.exports = ({
    globalList
}) => {
    printf('请确认您安装了 Node v14 及以上版本', ColorsEnum.RED);
    printf('请自行安装tslint等插件', ColorsEnum.RED);

    const s = new Set(defaultGlobalList.concat(globalList || []));

    exec(`npm i -g ${[...s].join(' ')}`);
};
