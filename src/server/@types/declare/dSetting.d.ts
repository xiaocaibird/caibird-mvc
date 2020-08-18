/**
 * Created by cmZhou
 * setting 常用类型
 */
declare namespace dSetting {
    type Config = {
        version: string;
        publicDbWriteUserName: string;
        publicDbWritePassword: string;
        publicDbHost: string;
        publicDbPort: string;
        publicRedisHost?: string;
        publicRedisPass?: string;
        publicRedisPort?: string;
    };

    type Secret = {
        tracingAnalysisEndpoint: string;
    };

    interface CustomConfig {
        reportPathWhiteList?: string;
        reportPathIgnoreList?: string;

        reportDbLogPathWhiteListWhenAlways?: string;

        reportWhiteListCtxKeys?: string;
        reportWhiteListCtxValues?: string;
    }

    interface CustomSecret { }
}
