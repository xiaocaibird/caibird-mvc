/**
 * @Owners cmZhou
 * @Title public html工具
 */

import createFormData from './createFormData';
import parseUrl from './parseUrl';
import stringifyQuery from './stringifyQuery';
import urlAddQuery from './urlAddQuery';

export const uHttp = {
    urlAddQuery,
    parseUrl,
    stringifyQuery,
    createFormData,
};

export default uHttp;
