/**
 * @Owners cmZhou
 * @Title style 工具
 */
export namespace uStyle {
    export const classes = (...list: Caibird.dp.Nullable<string>[]) => list.filter(item => !!item).join(' ');
}
