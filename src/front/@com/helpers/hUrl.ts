/**
 * @Owners cmZhou
 * @Title url helper
 */
export abstract class HUrl {
    public constructor(protected readonly options: {
        prefix?: string,
        imgPath: string,
    }) { }

    public readonly full = (url = '') => `${location.protocol}//${location.host}${this.options.prefix ?? ''}${url}`;

    public readonly image = (imgName: string) => `${this.options.imgPath}/${imgName}`;
}
