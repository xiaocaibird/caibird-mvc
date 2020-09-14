/**
 * @Creater cmZhou
 * @Desc setting 常用类型
 */
declare namespace dSetting {
    type Config = {
    };

    type Secret = {
        tracingAnalysisEndpoint?: string;

        publicDbUserName?: string;
        publicDbPassword?: string;
        publicDbHost?: string;
        publicDbPort?: string;

        publicRedisHost?: string;
        publicRedisPass?: string;
        publicRedisPort?: string;

        publicOssKeyId?: string;
        publicOssKeySecret?: string;
    };

    interface CustomConfig {
        version?: string;
        reportPathWhiteList?: string;
        reportPathIgnoreList?: string;

        reportDbLogPathWhiteListWhenAlways?: string;

        reportWhiteListCtxKeys?: string;
        reportWhiteListCtxValues?: string;
    }

    interface CustomSecret { }
}
