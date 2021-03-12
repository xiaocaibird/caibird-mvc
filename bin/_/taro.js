/**
 * @Owners cmZhou
 * @Title bin taro
 */
const path = require('path');
// eslint-disable-next-line @typescript-eslint/tslint/config
const { printPkgVersion } = require('@tarojs/cli/dist/util');
// eslint-disable-next-line @typescript-eslint/tslint/config
const Cli = require('@tarojs/cli/dist/cli').default;

printPkgVersion();

const cli = new Cli(path.join(process.cwd(), `src/${process.argv[process.argv.length - 1]}/front/taro`));
cli.run();
