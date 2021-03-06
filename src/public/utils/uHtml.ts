/**
 * @Owners cmZhou
 * @Title public html工具
 */
import htmlCode from 'html-entities';

export namespace uHtml {
    export const clear = (html: string) => html.replace(/<\/?[^>]*>/g, '');

    export const encode = (html: string) => new htmlCode.AllHtmlEntities().encode(html);

    export const decode = (str: string) => new htmlCode.AllHtmlEntities().decode(str);
}

export default uHtml;
