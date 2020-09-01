/**
 * @Creater cmZhou
 * @Desc public html工具
 */
import htmlCode from 'html-entities';

namespace _uHtml {
    export const clear = (html: string) => html.replace(/<\/?[^>]*>/g, '');

    export const encode = (html: string) => new htmlCode.AllHtmlEntities().encode(html);

    export const decode = (str: string) => new htmlCode.AllHtmlEntities().decode(str);
}

export const uHtml: dp.DeepReadonly<typeof _uHtml> = _uHtml;
export default uHtml;
