/**
 * @Owners cmZhou,zzh
 * @Title handleUuid函数
 * @Details 提供把uuid的'-'字符去除的功能
 */
type HandleOpt = {
    keepSeparator?: boolean,
};

export default (uuid: string, opt: HandleOpt = {}) => {
    const { keepSeparator } = opt;

    if (keepSeparator) {
        return uuid;
    }

    return uuid.replace(/-/g, '');
};
