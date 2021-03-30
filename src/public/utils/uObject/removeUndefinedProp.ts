/**
 * @Owners zzh
 * @Title public removeUndefinedProp
 * @Details 输出新对象，移除了值为undefined的key
 */

export const removeUndefinedProp = <T extends dp.Obj>(value: T) => {
    const result = {
        ...value,
    };
    for (const k in result) {
        if (result[k] === undefined) {
            delete result[k];
        }
    }

    return result;
};

export default removeUndefinedProp;
