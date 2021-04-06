/**
 * @Owners cmZhou
 * @Title cookie 工具
 */

export namespace uCookie {
    export const setValue = (name: string, value: string, days?: number | 'keep') => {
        const keepDays = 300000;

        let exp: Date | null = null;
        if (days != null) {
            exp = new Date();
            exp.setTime(exp.getTime() + (days === 'keep' ? keepDays : days) * eDate.MsCount.OneDay);
        }

        document.cookie = `${name}=${encodeURIComponent(value)}${exp == null ? '' : (`;expires=${exp.toUTCString()}`)}`;
    };

    export const getValue = (name: string) => {
        try {
            const reg = new RegExp(`(^| )${name}=([^;]*)(;|$)`);
            const arr = document.cookie.match(reg);
            if (arr) {
                return decodeURIComponent(arr[2]);
            }
            return undefined;
        } catch {
            return undefined;
        }
    };

    export const removeValue = (name: string) => {
        setValue(name, '', -1);
    };
}

