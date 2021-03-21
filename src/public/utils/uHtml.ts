/**
 * @Owners cmZhou
 * @Title public html工具
 */
import { decode as htmlDecode, encode as htmlEncode } from 'html-entities';

export namespace uHtml {
    export const clear = (html: string) => html.replace(/<\/?[^>]*>/g, '');

    export const encode = htmlEncode;

    export const decode = htmlDecode;
}

export default uHtml;
