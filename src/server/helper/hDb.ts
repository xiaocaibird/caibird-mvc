/**
 * @Creater cmZhou
 * @Desc db helper
 */
import moment from 'moment';
import Sequelize from 'sequelize';

import { reportHelper } from '../app/helper';
import { cError } from '../constant/cError';

export abstract class HDb {
    protected readonly baseOptions: Sequelize.Options = {
        dialect: 'mysql',
        pool: {
            max: 50,
            min: 0,
            idle: 5000
        },
        timezone: '+08:00',
        define: {
            createdAt: false,
            deletedAt: false,
            updatedAt: false
        },
        logging: (...p: any[]) => {
            const details = (p.length === 1 ? p[0] : p) as dp.Obj;
            reportHelper.dbLog({ key: 'sequelize_logging', msg: 'Sequelize logging', details });
        }
    };

    public readonly Op: dp.DeepReadonly<typeof Sequelize.Op> = Sequelize.Op;

    public readonly clearIllegalChar = (text: string) => text.replace(/[^\u0000-\uFFFF]/g, '');

    public readonly setOneToOne = (aTable: {
        model: Sequelize.Model<any, any>;
        key?: string;
        as?: string;
    }, bTable: {
        model: Sequelize.Model<any, any>;
        key?: string;
        as?: string;
    }, key?: string) => {
        aTable.model.belongsTo(bTable.model, { foreignKey: aTable.key || key, targetKey: bTable.key || key, as: bTable.as });
        bTable.model.belongsTo(aTable.model, { foreignKey: bTable.key || key, targetKey: aTable.key || key, as: aTable.as });
    }

    public readonly setOneToMany = (mainTable: {
        model: Sequelize.Model<any, any>;
        key?: string;
        as?: string;
    }, depTable: {
        model: Sequelize.Model<any, any>;
        key?: string;
        as?: string;
    }) => {
        mainTable.model.hasMany(depTable.model, { foreignKey: depTable.key, sourceKey: mainTable.key, as: depTable.as });
        depTable.model.belongsTo(mainTable.model, { foreignKey: depTable.key, targetKey: mainTable.key, as: mainTable.as });
    }

    public readonly getDateSubTableSuffix = (date: moment.MomentInput) => moment(date).format('YYYYMMDD');

    public readonly createSubTable = <I, A>(
        suffix: string,
        defineInfo: {
            attributes: Sequelize.DefineModelAttributes<A>;
            options: Sequelize.DefineOptions<I>;
            seq: Sequelize.Sequelize;
        }
    ) => defineInfo.seq.define<I, A>(`${defineInfo.options.tableName}_${suffix}`, defineInfo.attributes, {
        ...defineInfo.options,
        tableName: `${defineInfo.options.tableName}_${suffix}`
    })

    public readonly getDefineInfo = async <I, A>(
        dbSeq: Sequelize.Sequelize,
        defineFunc: (seq: Sequelize.Sequelize, Seq: Sequelize.SequelizeStatic) => Sequelize.Model<I, A>
    ) => new Promise<{
        attributes: Sequelize.DefineModelAttributes<A>;
        options: Sequelize.DefineOptions<I>;
        seq: Sequelize.Sequelize;
    }>((resolve, reject) => {
        dbSeq.beforeDefine(this.createSubTable.name, (attributes, options) => {
            resolve({
                attributes: attributes as Sequelize.DefineModelAttributes<A>,
                options,
                seq: dbSeq
            });
        });
        defineFunc(dbSeq, Sequelize);

        dbSeq.removeHook('beforeDefine', this.createSubTable.name);
        setTimeout(() => {
            reject(new cError.TimeoutJson());
        }, eDate.MsTimespan.PromiseTimeout);
    })
}
