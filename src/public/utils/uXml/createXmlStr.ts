/**
 * @Owners cmZhou,zzh
 * @Title xml createXmlStr函数
 * @Details 根据对象生成xml字符串
 */

export const createXmlStr = (params: Caibird.dp.Obj<string>) => {
    let xmlStr = '<xml>';

    Object.keys(params).forEach(key => {
        xmlStr += `<${key}><![CDATA[`;
        xmlStr += params[key];
        xmlStr += `]]></${key}>`;
    });

    xmlStr += '</xml>';

    return xmlStr;
};
