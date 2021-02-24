/**
 * @Creater cmZhou
 * @Desc public string工具
 */
export namespace uString {
    export const check = (obj: unknown): obj is string => typeof obj === 'string';

    export const equalIgnoreCase = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

    export const subText = (params: {
        str: string,
        maxLength: number,
        diffSBC?: boolean,
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
}

export default uString;
