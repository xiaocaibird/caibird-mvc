/**
 * @Owners cmZhou
 * @Title setting 常用类型
 */
declare namespace dSetting {
    namespace S {
        type CheckType<T extends dp.Obj<dp.Obj | string | undefined>> = T;

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

        type CheckInterface<T extends dp.Obj | string | undefined> = T;

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
}
