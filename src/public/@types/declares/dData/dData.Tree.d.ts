/**
 * @Creater cmZhou
 * @Desc 数据结构类型 Tree
 */
declare namespace dData {
    namespace Tree {
        type Id = string | number;
        // type Base = { id: Id; pid?: Id | null };
        type Base = {
            id: Id;
            [key: string]: any
        };
        type Item<T extends Base> = T & { children?: Item<T>[] };
    }
}
