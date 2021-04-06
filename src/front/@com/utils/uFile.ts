/**
 * @Owners cmZhou
 * @Title file 工具
 */
import { cError } from '../consts/cError';

import { uObject } from './uObject';

export namespace uFile {
    const readFile = async <TData extends FileReader['result']>(file: File, type: eFile.F.FileReaderResultDateType) =>
        new Promise<dFile.F.FileReaderResult<TData>>((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => {
                resolve({
                    code: eFile.F.FileReaderResultCode.Success,
                    data: fr.result as TData,
                    fileReader: fr,
                });
                clearTimeout(timeout);
            };
            fr.onerror = error => {
                reject({
                    code: eFile.F.FileReaderResultCode.Fail,
                    fileReader: fr,
                    error,
                });
                clearTimeout(timeout);
            };
            const timeout = setTimeout(() => {
                reject({
                    code: eFile.F.FileReaderResultCode.Timeout,
                    fileReader: fr,
                });
                fr.abort();
            }, eDate.MsTimespan.PromiseTimeout * eNumber.Common.Ten);

            if (type === eFile.F.FileReaderResultDateType.Binary) {
                fr.readAsBinaryString(file);
            } else if (type === eFile.F.FileReaderResultDateType.ArrayBuffer) {
                fr.readAsArrayBuffer(file);
            } else if (type === eFile.F.FileReaderResultDateType.DataUrl) {
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
        }, eDate.MsTimespan.PromiseTimeout * eNumber.Common.Ten);
    });

    export const getBinaryString = async (file: File) =>
        readFile<string>(file, eFile.F.FileReaderResultDateType.Binary);

    export const getArrayBuffer = async (file: File) =>
        readFile<ArrayBuffer>(file, eFile.F.FileReaderResultDateType.ArrayBuffer);

    export const getDataUrl = async (file: File) =>
        readFile<string>(file, eFile.F.FileReaderResultDateType.DataUrl);

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
                setTimeout(() => { resolve(imageInfo); }, eDate.MsTimespan.PromiseTimeout);
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
