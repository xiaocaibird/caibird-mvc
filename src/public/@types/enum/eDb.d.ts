/**
 * @Creater cmZhou
 * @Desc db常用枚举
 */
declare namespace eDb {
    const enum OrderType {
        ASC = 'ASC',
        DESC = 'DESC'
    }

    const enum Op {
        eq = 'eq',
        ne = 'ne',
        gte = 'gte',
        gt = 'gt',
        lte = 'lte',
        lt = 'lt',
        not = 'not',
        is = 'is',
        in = 'in',
        notIn = 'notIn',
        like = 'like',
        notLike = 'notLike',
        iLike = 'iLike',
        notILike = 'notILike',
        regexp = 'regexp',
        notRegexp = 'notRegexp',
        iRegexp = 'iRegexp',
        notIRegexp = 'notIRegexp',
        between = 'between',
        notBetween = 'notBetween',
        overlap = 'overlap',
        contains = 'contains',
        contained = 'contained',
        adjacent = 'adjacent',
        strictLeft = 'strictLeft',
        strictRight = 'strictRight',
        noExtendRight = 'noExtendRight',
        noExtendLeft = 'noExtendLeft',
        and = 'and',
        or = 'or',
        any = 'any',
        all = 'all',
        values = 'values',
        col = 'col',
        placeholder = 'placeholder',
        join = 'join',
        raw = 'raw'
    }
}
