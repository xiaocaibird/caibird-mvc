/**
 * @Creater cmZhou
 * @Desc date常用枚举
 */
declare namespace eDate {
    const enum Format {
        YMD = 'YYYY-MM-DD',
        YMD_Hm = 'YYYY-MM-DD HH:mm',
        YMD_Hm_ss = 'YYYY-MM-DD HH:mm:ss',
        YMD_Hm_ss_SSS = 'YYYY-MM-DD HH:mm:ss:SSS',
        Default = YMD
    }

    const enum DayCount {
        OneWeek = 7,
        OneMonth = 30,
        OneYear = 365
    }

    const enum MillisecondCount {
        OneSecond = 1000,

        FiveSecond = 5000,

        TenSecond = 10000,

        ThirySecond = 30000,

        OneMinute = 60000,

        FiveMinute = 300000,

        TenMinute = 600000,

        OneHour = 3600000,

        OneDay = 86400000,

        Chiliad = 525600000000
    }

    const enum SecondCount {
        OneHour = 3600,
        OneDay = 86400
    }

    const enum Timespan {
        PromiseTimeout = MillisecondCount.FiveSecond,
        RequestTimeout = 60000
    }

    const enum Per {
        MicrosecondPerMs = 1000,
        MsPerSecond = 1000,
        SecondPerMin = 60,
        MinPerHour = 60,
        HourPerDay = 24
    }
}
