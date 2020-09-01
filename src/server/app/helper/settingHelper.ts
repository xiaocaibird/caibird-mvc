/**
 * @Creater cmZhou
 * @Desc app settingHelper
 */
import fs from 'fs';
import path from 'path';

class SettingHelper {
    public static readonly instance: SettingHelper = new SettingHelper();
    private constructor() { }

    private readonly GLOBAL_CONFIG_NAME = 'config/global';

    private readonly GLOBAL_SECRET_NAME = 'secret/global';

    private readonly CUSTOM_CONFIG_NAME = 'config/custom';

    private readonly CUSTOM_SECRET_NAME = 'secret/custom';

    public readonly getValue = <T extends object = object>(key: keyof T, filename: string, dft?: string): string => {
        try {
            if (process.env.IS_LOCAL_TEST) {
                const relativePath = path.relative(__dirname, path.join(process.cwd(), `/dist/server/_dev/setting/${filename}`)).replace(/\\/g, '/');
                const obj = (require(relativePath) as { default: dp.Obj<string> }).default;
                return (obj[key] || dft || '').toString();
            }
            return fs.readFileSync(`/etc/my-setting/${filename}/${key}`, 'utf-8');
        } catch {
            return dft || '';
        }
    }

    public readonly getConfig = (key: keyof dSetting.Config, dft?: string) => this.getValue(key, this.GLOBAL_CONFIG_NAME, dft);

    public readonly getSecret = (key: keyof dSetting.Secret, dft?: string) => this.getValue(key, this.GLOBAL_SECRET_NAME, dft);

    public readonly getCustomConfig = (key: keyof dSetting.CustomConfig, dft?: string) => this.getValue(key, this.CUSTOM_CONFIG_NAME, dft);

    public readonly getCustomSecret = (key: keyof dSetting.CustomSecret, dft?: string) => this.getValue(key, this.CUSTOM_SECRET_NAME, dft);
}

export const settingHelper = SettingHelper.instance;
export default settingHelper;
