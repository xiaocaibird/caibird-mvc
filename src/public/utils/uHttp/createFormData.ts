/**
 * @Owners cmZhou,zzh
 * @Title public createFormData
 * @Details 根据对象创建并返回formData格式内容
 */
export const createFormData = (obj: Caibird.dp.Obj<Blob | string>) => {
    const formData = new FormData();
    Object.keys(obj).forEach(item => formData.append(item, obj[item]));
    return formData;
};
