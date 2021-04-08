/**
 * @Owners cmZhou
 * @Title file 工具
 */
import { cError } from '../consts/cError';

import { uObject } from './uObject';

export declare namespace FileEnum {
    const enum FileReaderResultCode {
        Success = 0, Fail = 1, Timeout = 2,
    }
    const enum FileReaderResultDateType {
        Binary = 0, ArrayBuffer = 1, DataUrl = 2,
    }
}

export declare namespace FileDeclare {
    type FileReaderResult<TData extends FileReader['result']> = {
        code: FileEnum.FileReaderResultCode,
        msg?: string,
        data?: TData,
        fileReader: FileReader,
        error?: ProgressEvent,
    };
}

export namespace uFile {
    const readFile = async <TData extends FileReader['result']>(file: File, type: FileEnum.FileReaderResultDateType) =>
        new Promise<FileDeclare.FileReaderResult<TData>>((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => {
                resolve({
                    code: FileEnum.FileReaderResultCode.Success,
                    data: fr.result as TData,
                    fileReader: fr,
                });
                clearTimeout(timeout);
            };
            fr.onerror = error => {
                reject({
                    code: FileEnum.FileReaderResultCode.Fail,
                    fileReader: fr,
                    error,
                });
                clearTimeout(timeout);
            };
            const timeout = setTimeout(() => {
                reject({
                    code: FileEnum.FileReaderResultCode.Timeout,
                    fileReader: fr,
                });
                fr.abort();
            }, Caibird.eDate.MsTimespan.PromiseTimeout * Caibird.eNumber.Common.Ten);

            if (type === FileEnum.FileReaderResultDateType.Binary) {
                fr.readAsBinaryString(file);
            } else if (type === FileEnum.FileReaderResultDateType.ArrayBuffer) {
                fr.readAsArrayBuffer(file);
            } else if (type === FileEnum.FileReaderResultDateType.DataUrl) {
                fr.readAsDataURL(file);
            }
        });

    export const readFileAsText = async (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (event: ProgressEvent) => {
            let txt = (event.target as FileReader).result;
            if (!txt) txt = '';
            if (typeof txt !== 'string') {
                txt = JSON.stringify(txt);
            }
            resolve(txt);
            clearTimeout(timeout);
        };
        reader.onerror = e => {
            reject(e);
            clearTimeout(timeout);
        };
        const timeout = setTimeout(() => {
            reject(new cError.CommonError({ key: 'readFileAsText_timeout', msg: 'readFileAsText timeout' }));
            reader.abort();
        }, Caibird.eDate.MsTimespan.PromiseTimeout * Caibird.eNumber.Common.Ten);
    });

    export const getBinaryString = async (file: File) =>
        readFile<string>(file, FileEnum.FileReaderResultDateType.Binary);

    export const getArrayBuffer = async (file: File) =>
        readFile<ArrayBuffer>(file, FileEnum.FileReaderResultDateType.ArrayBuffer);

    export const getDataUrl = async (file: File) =>
        readFile<string>(file, FileEnum.FileReaderResultDateType.DataUrl);

    export const getImgSize = async (img: File | string) => {
        type ImgInfo = { width: number, height: number };
        return new Promise<ImgInfo>((resolve, _reject) => {
            const imageInfo = {
                width: 0,
                height: 0,
            };

            if (!img) {
                resolve(imageInfo);
                return;
            }

            const image = new Image();
            const src = uObject.checkInstance(img, Blob) ? URL.createObjectURL(img) : img;

            image.src = src;

            if (image.complete) { // 有缓存
                imageInfo.width = image.naturalWidth || image.width;
                imageInfo.height = image.naturalHeight || image.height;
                resolve(imageInfo);
            } else {
                image.onload = () => {
                    imageInfo.width = image.naturalWidth || image.width;
                    imageInfo.height = image.naturalHeight || image.height;
                    resolve(imageInfo);
                };
                image.onerror = () => {
                    resolve(imageInfo);
                };
                setTimeout(() => { resolve(imageInfo); }, Caibird.eDate.MsTimespan.PromiseTimeout);
            }
        });
    };

    export const dataURLtoBlob = (dataurl: string) => {
        const arr = dataurl.split(',');
        const match = /:(.*?);/.exec(arr[0]);
        const mime = match?.[1];
        const bstr = atob(arr[1]);

        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime ?? '' });
    };
}
