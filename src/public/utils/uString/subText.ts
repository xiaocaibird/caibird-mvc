/**
 * @Owners zzh
 * @Title public subText
 * @Details 限定长度输出字符串，被截取内容用suffix表示
 */

export const subText = (params: {
    str: string,
    maxLength: number,
    diffSBC?: boolean, // diff Single Byte Character:中文是否计算两个字符
    suffix?: string,
}) => {
    const { str, maxLength, diffSBC = true, suffix = '..' } = params;
    if (diffSBC) {
        let l = 0;
        let a = '';
        const maxCode = 128;
        for (let i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) > maxCode) {
                l += 2;
            } else {
                l += 1;
            }
            if (l <= maxLength) {
                a += str[i];
            } else {
                a += suffix;
                break;
            }
        }
        return a;
    }
    return str.length > maxLength ? str.slice(0, maxLength) + suffix : str;
};

export default subText;
