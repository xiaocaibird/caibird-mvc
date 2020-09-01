/**
 * @Creater cmZhou
 * @Desc style helper
 */
export abstract class HStyle {
    public readonly classes = (...list: dp.AllowNon<string>[]) => list.filter(item => !!item).join(' ');
}
