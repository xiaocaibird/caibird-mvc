/**
 * @Owners cmZhou
 * @Title dTree
 */
export namespace dTree {
    type Id = number | string;
    type Base = { id: Id, pid?: Id | null };
    type Item<T extends Base> = T & { children?: Item<T>[] };
}
