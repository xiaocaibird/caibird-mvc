/**
 * Created by cmZhou
 * 清理git tag
 */
const {
    readline,
    exec
} = require('../util');

module.exports = async () => {
    const filterStr = await readline('请输入要清除的tag的关键字：');
    const tags = exec('git tag', false).split('\n').filter(item => item.includes(filterStr));
    exec(`git push origin ${tags.map(item => item && item.trim() && `:refs/tags/${item}` || '').join(' ')}`);
    exec(`git tag -d ${tags.join(' ')}`);
};
