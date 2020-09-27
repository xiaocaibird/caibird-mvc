/**
 * @Creater cmZhou
 * @Desc style 工具
 */
namespace _uStyle {
    export const classes = (...list: dp.AllowNon<string>[]) => list.filter(item => !!item).join(' ');
}

export const uStyle: dp.DeepReadonly<typeof _uStyle> = _uStyle;
export default uStyle;
