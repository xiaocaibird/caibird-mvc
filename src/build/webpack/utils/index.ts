/**
 * @Owners cmZhou
 * @Title webpack util
 */
import ini from '../../ini';

const { isTest, isExpProduction } = ini;

const filenameBase = `${isTest ? '' : `${isExpProduction ? '.exp.' : '.'}` + '[chunkhash]'}.js`;

const entryPointsNames = {
    runtime: 'runtime',
    vendor: 'vendor',
    entry: 'entry',
} as const;

export default {
    filenameBase,
    entryPointsNames,
};
