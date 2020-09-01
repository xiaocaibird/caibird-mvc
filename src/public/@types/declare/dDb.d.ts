/**
 * @Creater cmZhou
 * @Desc db 常用类型
 */
declare namespace dDb {
    type Config = {
        userName: string;
        password: string;
        host: string;
        port: number;
    };

    type AssociationInstance<TInstance extends import('sequelize').Instance<any>, TAssociationAttributes extends object> =
        TInstance extends import('sequelize').Instance<infer TAttributes> ? import('sequelize').Instance<TAttributes & TAssociationAttributes> & TAttributes & TAssociationAttributes : never;
}
