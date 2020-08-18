/**
 * Created by cmZhou
 * bin util
 */
const shelljs = require('shelljs');

process.on('unhandledRejection', err => {
    process.exit();
});
process.on('uncaughtException', err => {
    process.exit();
});

const exec = (cmd, printfInfo = true) => shelljs.exec(cmd.replace(/\n/g, ' '), {
    silent: !printfInfo
}).stdout;

const execAndGetDetails = (cmd, printfInfo = true) => shelljs.exec(cmd.replace(/\n/g, ' '), {
    silent: !printfInfo
});

const _colorsInfo = {
    default: '%s',
    red: '\x1B[31m%s\x1B[0m',
    green: '\x1B[32m%s\x1B[0m',
    yellow: '\x1B[33m%s\x1B[0m',
    cyan: '\x1B[36m%s\x1B[0m'
};
const ColorsEnum = {
    DEFAULT: 'default',
    RED: 'red',
    GREEN: 'green',
    YELLOW: 'yellow',
    CYAN: 'cyan'
};
const printf = (info, color = ColorsEnum.DEFAULT) => console.log(_colorsInfo[color] || _colorsInfo.default, info);

const readline = (title, color = ColorsEnum.YELLOW) => new Promise(resolve => {
    printf(title, color);
    const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('', answer => {
        resolve(answer);
        rl.close();
    });
});

module.exports = {
    exec,
    execAndGetDetails,
    printf,
    readline,
    ColorsEnum
};
