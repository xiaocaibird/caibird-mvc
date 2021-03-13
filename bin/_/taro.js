/**
 * @Owners cmZhou
 * @Title bin taro
 */
const path = require('path');
const { printPkgVersion } = require('@tarojs/cli/dist/util');
const Cli = require('@tarojs/cli/dist/cli').default;

printPkgVersion();

const cli = new Cli(path.join(process.cwd(), `src/${process.argv[process.argv.length - 1]}/front/taro`));
cli.run();
