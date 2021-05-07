/**
 * @Owners cmZhou
 * @Title app settingHelper
 */
import fs from 'fs';
import path from 'path';

import { dSetting } from '../../@types/declares';

class SettingHelper {
    public static readonly instance = new SettingHelper();
    private constructor() { }

    private projectName = '';

    private readonly GLOBAL_CONFIG_NAME = 'config/global';

    private readonly GLOBAL_SECRET_NAME = 'secret/global';

    private readonly CUSTOM_CONFIG_NAME = 'config/custom';

    private readonly CUSTOM_SECRET_NAME = 'secret/custom';

    public readonly setProjectName = (name: string) => this.projectName = name;

    public readonly getValue = <T extends dSetting.CustomConfig | dSetting.CustomSecret | dSetting.GlobalConfig | dSetting.GlobalSecret, TKey extends keyof T>(
        key: TKey, filename: string, dft?: T[TKey],
    ): Caibird.dp.DeepPartial<T[TKey]> | undefined => {
        try {
            if (Caibird.env.IS_LOCAL_TEST) {
                const relativePath = path.relative(__dirname, path.join(process.cwd(), `/dist/${Caibird.env.PROJECT_NAME}/server/helpers/hSetting/_dev/${filename}`)).replace(/\\/g, '/');
                // eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/no-require-imports
                const obj = (require(relativePath) as { default: T }).default;
                return (obj[key] || dft) as Caibird.dp.DeepPartial<T[TKey]>;
            }
            const jsonStr = fs.readFileSync(`/etc/my-setting/${filename}/${key.toString()}`, 'utf-8');

            try {
                const obj: unknown = JSON.parse(jsonStr);
                if (obj && typeof obj === 'object') {
                    return obj as Caibird.dp.DeepPartial<T[TKey]>;
                }

                return jsonStr as unknown as Caibird.dp.DeepPartial<T[TKey]>;
            } catch {
                return jsonStr as unknown as Caibird.dp.DeepPartial<T[TKey]>;
            }
        } catch {
            return dft as Caibird.dp.DeepPartial<T[TKey]>;
        }
    };

    public readonly getGlobalConfig = <TKey extends keyof dSetting.GlobalConfig>(key: TKey, dft?: dSetting.GlobalConfig[TKey]) => this.getValue<dSetting.GlobalConfig, TKey>(key, this.GLOBAL_CONFIG_NAME, dft);

    public readonly getGlobalSecret = <TKey extends keyof dSetting.GlobalSecret>(key: TKey, dft?: dSetting.GlobalSecret[TKey]) => this.getValue<dSetting.GlobalSecret, TKey>(key, this.GLOBAL_SECRET_NAME, dft);

    public readonly getCustomConfig = <TKey extends keyof dSetting.CustomConfig>(key: TKey, dft?: dSetting.CustomConfig[TKey]) => this.getValue<dSetting.CustomConfig, TKey>(key, this.CUSTOM_CONFIG_NAME, dft);

    public readonly getCustomSecret = <TKey extends keyof dSetting.CustomSecret>(key: TKey, dft?: dSetting.CustomSecret[TKey]) => this.getValue<dSetting.CustomSecret, TKey>(key, this.CUSTOM_SECRET_NAME, dft);
}

export const settingHelper = SettingHelper.instance;
