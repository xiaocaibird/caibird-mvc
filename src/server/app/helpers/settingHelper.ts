/**
 * @Owners cmZhou
 * @Title app settingHelper
 */
import fs from 'fs';
import path from 'path';

export declare namespace SettingDeclare {
    type CheckType<T extends dCaibird.Obj<dCaibird.Obj | string | undefined>> = T;

    type GlobalConfig = CheckType<{
    }>;

    type GlobalSecret = CheckType<{
        tracingAnalysisEndpoint?: string,

        publicDbConfig?: {
            username: string,
            password: string,
            host: string,
            port: number,
        },
        publicRedisConfig?: {
            host: string,
            password: string,
            port: number,
        },

        publicOssConfig?: {
            accessKeyId: string,
            accessKeySecret: string,
        },
    }>;

    type CheckInterface<T extends dCaibird.Obj | string | undefined> = T;

    type CheckCustomConfig = CheckInterface<CustomConfig[keyof CustomConfig]>;
    interface CustomConfig {
        version?: string,

        reportConfig?: {
            pathWhiteList?: string[],
            pathIgnoreList?: string[],
            dbLogPathWhiteListWhenAlways?: string[],
            whiteListCtxKeys?: string[],
            whiteListCtxValues?: string[],
        },
    }

    type CheckCustomSecret = CheckInterface<CustomSecret[keyof CustomSecret]>;
    interface CustomSecret { }
}

class SettingHelper {
    public static readonly instance = new SettingHelper();
    private constructor() { }

    private projectName = '';

    private readonly GLOBAL_CONFIG_NAME = 'config/global';

    private readonly GLOBAL_SECRET_NAME = 'secret/global';

    private readonly CUSTOM_CONFIG_NAME = 'config/custom';

    private readonly CUSTOM_SECRET_NAME = 'secret/custom';

    public readonly setProjectName = (name: string) => this.projectName = name;

    public readonly getValue = <T extends SettingDeclare.CustomConfig | SettingDeclare.CustomSecret | SettingDeclare.GlobalConfig | SettingDeclare.GlobalSecret, TKey extends keyof T>(
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

    public readonly getGlobalConfig = <TKey extends keyof SettingDeclare.GlobalConfig>(key: TKey, dft?: SettingDeclare.GlobalConfig[TKey]) => this.getValue<SettingDeclare.GlobalConfig, TKey>(key, this.GLOBAL_CONFIG_NAME, dft);

    public readonly getGlobalSecret = <TKey extends keyof SettingDeclare.GlobalSecret>(key: TKey, dft?: SettingDeclare.GlobalSecret[TKey]) => this.getValue<SettingDeclare.GlobalSecret, TKey>(key, this.GLOBAL_SECRET_NAME, dft);

    public readonly getCustomConfig = <TKey extends keyof SettingDeclare.CustomConfig>(key: TKey, dft?: SettingDeclare.CustomConfig[TKey]) => this.getValue<SettingDeclare.CustomConfig, TKey>(key, this.CUSTOM_CONFIG_NAME, dft);

    public readonly getCustomSecret = <TKey extends keyof SettingDeclare.CustomSecret>(key: TKey, dft?: SettingDeclare.CustomSecret[TKey]) => this.getValue<SettingDeclare.CustomSecret, TKey>(key, this.CUSTOM_SECRET_NAME, dft);
}

export const settingHelper = SettingHelper.instance;
