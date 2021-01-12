/**
 * @Creater cmZhou
 * @Desc style 工具
 */
export namespace uStyle {
    export const classes = (...list: dp.AllowNon<string>[]) => list.filter(item => !!item).join(' ');
}

export default uStyle;
