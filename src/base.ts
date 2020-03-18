import { getWhereToString, formatJoin } from './uitl.js'
import { conf, sqlObj } from './type/interface';

export default class Base {
    config: conf;
    sqlObj: sqlObj = {};
    pageNum: number = 1;
    pageSize: number = 50;

    constructor(config: conf) {
        this.config = config;
    }

    /**
     * 要查询的表
     * @param tableName 
     */
    table(tableName: string) {
        if (!tableName) {
            throw new Error('无效的表名!');
        }

        if (this.config.defaultSqlPre) {
            tableName = this.config.defaultSqlPre + tableName;
        }

        if (tableName) this.sqlObj.table = tableName
        return this;
    }

    /**
     * 表的别名
     * @param tableAlias 
     */
    alias(tableAlias: string) {
        if (tableAlias) {
            this.sqlObj.alias = tableAlias
        } else {
            throw new Error('请输入有效的别名')
        }

        return this;
    }

    /**
     * 字段
     * @param opt
     * field('id, name as n,age')  | field(['id','name as n','i. age'])
     */
    field(opt: string | any[]) {
        if (typeof (opt) === 'object') {
            opt = opt.join(',')
        }
        this.sqlObj.field = opt
        return this;
    }

    /**
     * 查询条件
     * @param str
     * 
     */
    where(opt: string | any[]) {
        let result: string = ''

        if (typeof (opt) === 'string') {
            result = opt
        } else {
            result = getWhereToString(opt)
        }
        if (result) this.sqlObj.where = result
        return this;
    }

    /**
     * 设置数据,用在update和insert
     * @param data 
     */
    data(data: string | object) {
        let newData: object = {}

        if (typeof (data) === 'string') {
            let arr = data.split('&')
            arr.forEach(item => {
                let itemArr = item.split('=')
                newData[itemArr[0]] = itemArr[1]
            })
        } else {
            newData = data
        }
        this.sqlObj.data = newData
        return this
    }

    /**
     * order排序
     * order(['id','number asc'])  | order('id desc')
     * @param opt 
     */
    order(opt: string | any[]) {
        let orderby: string = 'ORDER BY'

        if (typeof (opt) === 'object') {
            opt = opt.join(',')
        }

        this.sqlObj.order = `${orderby} ${opt}`
        return this
    }

    /**
     * limit
     * @param 不定参数 
     * limit(10)  | limit(10,20)
     */
    limit(...args: number[]) {
        if (args.length > 2) {
            throw new Error('limit()的参数为不能大于两个!');
        } else {
            this.sqlObj.limit = `LIMIT ${args.join(',')}`
        }

        return this
    }

    /**
     * 分页
     * @param 不定参数 
     * page(2,10)
     * 第一个参数：第几页；第二个参数：每页条数
     */
    page(...args: number[]) {
        if (args.length === 2) {
            let [begin, end]: number[] = args;
            begin = begin || this.pageNum;
            end = end || this.pageSize;

            begin = (begin - 1) * end;

            this.sqlObj.limit = `LIMIT ${begin}, ${end}`
        } else {
            throw new Error('page()的参数为两个整型数字!');
        }
        return this
    }

    join(obj: object) {
        this.sqlObj.join = formatJoin(obj, this.sqlObj.alias, this.sqlObj.table)

        return this;
    }

    /**
     * 联合
     * @param str 
     * @param type 
     * union('SELECT name FROM node_user_1') | union(['SELECT name FROM node_user_1','SELECT name FROM node_user_2'])
     */
    union(str: string | string[], type: boolean = false) {
        if (typeof (str) === 'string') {
            if (this.sqlObj.union) {
                this.sqlObj.union = `${this.sqlObj.union} (${str}) ${type ? 'UNION ALL' : 'UNION'}`
            } else {
                this.sqlObj.union = `(${str}) ${type ? 'UNION ALL' : 'UNION'} `
            }
        } else if (typeof (str) === 'object') {
            if (this.sqlObj.union) {
                this.sqlObj.union = `${this.sqlObj.union} (${str.join(type ? ') UNION ALL (' : ') UNION (')})  ${type ? 'UNION ALL' : 'UNION'} `
            } else {
                this.sqlObj.union = `(${str.join(type ? ') UNION ALL (' : ') UNION (')}) ${type ? 'UNION ALL' : 'UNION'} `
            }
        }
        return this
    }

    /**
     * 返回唯一不同的值
     * @param flag 
     * distinct(true)
     */
    distinct(field: string) {
        if (field) {
            this.sqlObj.distinct = `DISTINCT ${field}`
        }
        return this
    }

    /**
     * 锁
     * @param flag 
     * lock(true)
     */
    lock(flag: boolean) {
        if (flag) {
            this.sqlObj.lock = 'FOR UPDATE'
        }
        return this
    }

    /**
     * 用于在生成的SQL语句中添加注释内容
     * @param str 
     */
    comment(str: string) {
        if (str) {
            this.sqlObj.comment = `/* ${str} */`
        }
        return this
    }

    /**
     * 根据一个或多个列对结果集进行分组
     * @param field 
     * group('id,name')
     */
    group(field: string) {
        this.sqlObj.group = `GROUP BY ${field}`
        return this
    }

    /**
     * 筛选
     * @param field 
     * having('count(number)>3')
     */
    having(field: string) {
        this.sqlObj.having = `HAVING ${field}`
        return this
    }

    /**
     * 合计
     * @param field 
     */
    count(field: number | string = 1, alias: string = 'total') {
        this.sqlObj.count = `COUNT(${field}) AS ${alias}`
        return this
    }

    /**
     * 最大值
     * @param field 
     */
    max(field: string, alias: string = 'max') {
        if (field) {
            this.sqlObj.max = `MAX(${field}) AS ${alias}`
        }
        return this
    }

    /**
     * 最小值
     * @param field 
     */
    min(field: string, alias: string = 'min') {
        if (field) {
            this.sqlObj.min = `MIN(${field}) AS ${alias}`
        }
        return this
    }

    /**
     * 平均值
     * @param field 
     */
    avg(field: string, alias: string = 'avg') {
        if (field) {
            this.sqlObj.avg = `AVG(${field}) AS ${alias}`
        }
        return this
    }

    /**
     * 和
     * @param field 
     */
    sum(field: string, alias: string = 'sum') {
        if (field) {
            this.sqlObj.sum = `SUM(${field}) AS ${alias}`
        }
        return this
    }
}