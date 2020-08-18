/**
 * Created by cmZhou
 * file 工具
 */
import { uObject } from './uObject';
namespace _uFile {
    const readFile = async <TData extends FileReader['result']>(file: File, type: eFile.FileReaderResultDateType) =>
        new Promise<dFile.FileReaderResult<TData>>((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = function () {
                resolve({
                    code: eFile.FileReaderResultCode.Success,
                    data: fr.result as TData,
                    fileReader: fr
                });
            };
            fr.onerror = function (error) {
                reject({
                    code: eFile.FileReaderResultCode.Fail,
                    fileReader: fr,
                    error
                });
            };
            setTimeout(() => {
                if (fr.readyState !== fr.DONE) {
                    fr.abort();
                    reject({
                        code: eFile.FileReaderResultCode.Timeout,
                        fileReader: fr
                    });
                }
            }, eDate.Timespan.PromiseTimeout * eNumber.Common.Ten);

            if (type === eFile.FileReaderResultDateType.Binary) {
                fr.readAsBinaryString(file);
            } else if (type === eFile.FileReaderResultDateType.ArrayBuffer) {
                fr.readAsArrayBuffer(file);
            } else if (type === eFile.FileReaderResultDateType.DataUrl) {
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
        };
        reader.onerror = (e: ProgressEvent) => {
            reject(e);
        };
    });

    export const getBinaryString = async (file: File) =>
        readFile<string>(file, eFile.FileReaderResultDateType.Binary);

    export const getArrayBuffer = async (file: File) =>
        readFile<ArrayBuffer>(file, eFile.FileReaderResultDateType.ArrayBuffer);

    export const getDataUrl = async (file: File) =>
        readFile<string>(file, eFile.FileReaderResultDateType.DataUrl);

    export const getImgSize = async (img: string | File) => {
        type ImgInfo = { width: number; height: number };
        return new Promise<ImgInfo>((resolve, _reject) => {
            const imageInfo = {
                width: 0,
                height: 0
            };

            if (!img) {
                resolve(imageInfo);
                return;
            }

            const image = new Image();
            const src = uObject.checkInstance(img, Blob) ? window.URL.createObjectURL(img) : img;

            image.src = src;

            if (image.complete) {// 有缓存
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
                setTimeout(() => { resolve(imageInfo); }, eDate.Timespan.PromiseTimeout);
            }
        });
    };

    export const dataURLtoBlob = (dataurl: string) => {
        const arr = dataurl.split(',');
        const match = arr[0].match(/:(.*?);/);
        const mime = match && match[1];
        const bstr = atob(arr[1]);

        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime || '' });
    };
}

export const uFile: dp.DeepReadonly<typeof _uFile> = _uFile;
export default uFile;
