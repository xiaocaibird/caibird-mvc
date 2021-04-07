/**
 * @Owners cmZhou
 * @Title app settingHelper
 */
import fs from 'fs';
import path from 'path';

class SettingHelper {
    public static readonly instance = new SettingHelper();
    private constructor() { }

    private projectName = '';

    private readonly GLOBAL_CONFIG_NAME = 'config/global';

    private readonly GLOBAL_SECRET_NAME = 'secret/global';

    private readonly CUSTOM_CONFIG_NAME = 'config/custom';

    private readonly CUSTOM_SECRET_NAME = 'secret/custom';

    public readonly setProjectName = (name: string) => this.projectName = name;

    public readonly getValue = <T extends dSetting.S.CustomConfig | dSetting.S.CustomSecret | dSetting.S.GlobalConfig | dSetting.S.GlobalSecret, TKey extends keyof T>(
        key: TKey, filename: string, dft?: T[TKey],
    ): dCaibird.DeepPartial<T[TKey]> | undefined => {
        try {
            if (CaibirdEnv.IS_LOCAL_TEST) {
                const relativePath = path.relative(__dirname, path.join(process.cwd(), `/dist/${this.projectName}/server/_dev/setting/${filename}`)).replace(/\\/g, '/');
                // eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/no-require-imports
                const obj = (require(relativePath) as { default: T }).default;
                return (obj[key] || dft) as dCaibird.DeepPartial<T[TKey]>;
            }
            const jsonStr = fs.readFileSync(`/etc/my-setting/${filename}/${key.toString()}`, 'utf-8');

            try {
                const obj: unknown = JSON.parse(jsonStr);
                if (obj && typeof obj === 'object') {
                    return obj as dCaibird.DeepPartial<T[TKey]>;
                }

                return jsonStr as unknown as dCaibird.DeepPartial<T[TKey]>;
            } catch {
                return jsonStr as unknown as dCaibird.DeepPartial<T[TKey]>;
            }
        } catch {
            return dft as dCaibird.DeepPartial<T[TKey]>;
        }
    };

    public readonly getGlobalConfig = <TKey extends keyof dSetting.S.GlobalConfig>(key: TKey, dft?: dSetting.S.GlobalConfig[TKey]) => this.getValue<dSetting.S.GlobalConfig, TKey>(key, this.GLOBAL_CONFIG_NAME, dft);

    public readonly getGlobalSecret = <TKey extends keyof dSetting.S.GlobalSecret>(key: TKey, dft?: dSetting.S.GlobalSecret[TKey]) => this.getValue<dSetting.S.GlobalSecret, TKey>(key, this.GLOBAL_SECRET_NAME, dft);

    public readonly getCustomConfig = <TKey extends keyof dSetting.S.CustomConfig>(key: TKey, dft?: dSetting.S.CustomConfig[TKey]) => this.getValue<dSetting.S.CustomConfig, TKey>(key, this.CUSTOM_CONFIG_NAME, dft);

    public readonly getCustomSecret = <TKey extends keyof dSetting.S.CustomSecret>(key: TKey, dft?: dSetting.S.CustomSecret[TKey]) => this.getValue<dSetting.S.CustomSecret, TKey>(key, this.CUSTOM_SECRET_NAME, dft);
}

export const settingHelper = SettingHelper.instance;
