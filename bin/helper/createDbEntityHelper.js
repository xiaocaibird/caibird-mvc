/**
 * @Creater cmZhou
 * @Desc 根据数据库中的表，创建sequelize的model
 */
const {
    readline,
    exec
} = require('../util');

module.exports = async path => {
    try {
        const dbName = await readline('请输入db名：');

        let dbInfo = '-h localhost -u root -x 123456 -p 3306';
        const newDbInfo = await readline(`默认db连接信息为"${dbInfo}"，要更改请输入新的连接信息，不更改直接回车：`);

        if (newDbInfo) {
            dbInfo = newDbInfo;
        }

        exec(`rimraf ${path}/.create ${path}/${dbName} &&
          sequelize-auto-xcb -z -C ${dbInfo} -d ${dbName} -e mysql -o "${path}/.create/${dbName}" &&
          shx cp -R -F ${path}/.create/${dbName} ${path}`);
    } catch (e) {

    } finally {
        exec(`rimraf ${path}/.create`);
    }
};
