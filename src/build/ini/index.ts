/**
 * @Owners cmZhou
 * @Title 项目构建初始化文件
 */
// eslint-disable-next-line no-restricted-imports
import { nodeEnvValues, runStatus } from '../config';
namespace _ini {
    export const NODE_ENV_VALUE = runStatus.isProduction ? nodeEnvValues.PRODUCTION : nodeEnvValues.DEVELOPMENT;
}

const ini: dp.DeepReadonly<typeof _ini & typeof runStatus> = {
    ...runStatus,
    ..._ini,
};

export default ini;
