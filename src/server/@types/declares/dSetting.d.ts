/**
 * @Owners cmZhou
 * @Title dSetting
 */
export namespace dSetting {
    type CheckType<T extends Caibird.dp.Obj<Caibird.dp.Obj | string | undefined>> = T;

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
    interface CustomSecret {
        publicImConfig?: {
            /**
             * 当前应用的key
             */
            appKey: string,
            /**
             * 对方应用的key
             */
            targetKey: string,
            /**
             * 当前应用的密钥
             */
            masterSecret: string,
        },
    }
}
