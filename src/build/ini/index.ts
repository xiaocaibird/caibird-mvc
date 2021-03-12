/**
 * @Owners cmZhou
 * @Title 项目构建初始化文件
 */
import { envValues, runStatus } from '../config';
namespace _ini {
    export const NODE_ENV_VALUE = runStatus.isProduction ? envValues.NODE_ENV.PRODUCTION : envValues.NODE_ENV.DEVELOPMENT;
}

const ini: dp.DeepReadonly<typeof _ini & typeof runStatus> = {
    ...runStatus,
    ..._ini,
};

export default ini;
