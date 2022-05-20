/**
 * @Owners cmZhou
 * @Title dSetting
 */
export namespace dSetting {
    type CheckType<T extends Caibird.dp.Obj<Caibird.dp.Obj | string | undefined>> = T;

    // eslint-disable-next-line @typescript-eslint/ban-types
    type GlobalConfig = CheckType<{}>;

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

    type CheckInterface<T extends Caibird.dp.Obj | string | undefined> = T;

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
