/**
 * @Owners cmZhou
 * @Title date常用枚举
 */
declare namespace eDate {
    const enum Format {
        Default_YMD = 'YYYY-MM-DD',
        Default_YMD_Hm = 'YYYY-MM-DD HH:mm',
        Default_YMD_Hms = 'YYYY-MM-DD HH:mm:ss',
        Default_YMD_HmsS = 'YYYY-MM-DD HH:mm:ss:SSS',

        Short_YMD = 'YYYYMMDD',
        Short_YMD_Hm = 'YYYYMMDDHHmm',
        Short_YMD_Hms = 'YYYYMMDDHHmmss',
        Short_YMD_HmsS = 'YYYYMMDDHHmmssSSS',

        CN_YMD = 'YYYY年MM月DD日',
        CN_YMD_Hm = 'YYYY年MM月DD日HH时mm分',
        CN_YMD_Hms = 'YYYY年MM月DD日HH时mm分ss秒',
    }

    const enum DayCount {
        OneWeek = 7,
        OneMonth = 30,
        OneYear = 365,
    }

    const enum MsCount {
        HalfSec = 500,
        OneSec = 1000,
        FiveSec = 5000,
        TenSec = 10000,
        ThirySec = 30000,
        OneMin = 60000,
        FiveMin = 300000,
        TenMin = 600000,
        OneHour = 3600000,
        OneDay = 86400000,
        Chiliad = 525600000000,
    }

    const enum SecCount {
        ThirySec = 30,
        OneMin = 60,
        FiveMin = 300,
        TenMin = 600,
        OneHour = 3600,
        OneDay = 86400,
    }

    const enum MsTimespan {
        PromiseTimeout = MsCount.FiveSec,
        RequestTimeout = 60000,
    }

    const enum Per {
        MicroToMs = 1000,
        MsToSec = 1000,
        SecToMin = 60,
        MinToHour = 60,
        HourToDay = 24,
    }
}
