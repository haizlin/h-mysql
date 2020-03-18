import {
    sortSelectSql,
    checkType,
    handleInsertData,
    isEmptyObj
} from './uitl'
import { conf, sqlObj } from './type/interface';

export default class Curd {
    config: conf;
    sqlObj: sqlObj = {};

    constructor(config: conf) {
        this.config = config;
    }

    /**
     * 查询
     */
    select() {
        let result: string = ''
        this.sqlObj.queryType = 'select';

        if (this.sqlObj.union) {
            result = this.sqlObj.union
            if (result.substr(-10).indexOf('ALL') != -1) {
                result = result.replace(/\sUNION\sALL\s*$/, '')
            } else {
                result = result.replace(/\sUNION\s*$/, '')
            }
            this.sqlObj = {}
            return result
        }

        let newSqlObj = sortSelectSql(this.sqlObj)

        newSqlObj.sortkeys.forEach(item => {
            if (newSqlObj.result[item]) {
                result = `${result} ${newSqlObj.result[item]}`
            }
        })
        const sqlStr = `SELECT ${result.replace(/'/g, '\'')} `;

        this.sqlObj.sqlStr = sqlStr;
        return this;
    }

    /**
     * 查找一条
     */
    find() {
        this.sqlObj.queryType = 'find';
        let result: string = ''
        if (this.sqlObj.union) {
            result = this.sqlObj.union
            if (result.substr(-10).indexOf('ALL') != -1) {
                result = result.replace(/\sUNION\sALL\s*$/, '')
            } else {
                result = result.replace(/\sUNION\s*$/, '')
            }
            this.sqlObj = {};
            return result
        }

        this.sqlObj.limit = `LIMIT 0, 1`;

        let newSqlObj = sortSelectSql(this.sqlObj)
        newSqlObj.sortkeys.forEach(item => {
            if (newSqlObj.result[item]) {
                result = `${result} ${newSqlObj.result[item]}`
            }
        })

        const sqlStr = `SELECT ${result.replace(/'/g, '\'')} `;

        this.sqlObj.sqlStr = sqlStr;
        return this;
    }

    /**
     * 更新
     */
    update() {
        let result = '';
        let datastr = '';
        let newData: Object = this.sqlObj.data || {};
        this.sqlObj.queryType = 'update';

        // update必须有where
        if (isEmptyObj(this.sqlObj.where) || this.sqlObj.where === '') {
            return false;
        }

        let keys = Object.keys(newData);

        // if(keys.length === 0){
        //     return this.sqlObj.error = '.data()必须有数据';
        // }

        keys.forEach((item, index) => {
            datastr += `${item}='${checkType(newData[item], item)}'` + ((index === keys.length - 1) ? ' ' : ',');
        })

        result = `UPDATE ${this.sqlObj.table} SET ${datastr} WHERE ${this.sqlObj.where}`
        // const sqlStr = result.replace(/'/g, '\'').replace(/`/g, '\'');
        const sqlStr = result.replace(/'/g, '\'');
        this.sqlObj.sqlStr = sqlStr;
        return this;
    }

    /**
     * 批量更新
     */
    updateMany() {
        this.sqlObj.queryType = 'updateMany';
    }

    /**
     * 添加
     */
    insert() {
        this.sqlObj.queryType = 'insert';
        let newData = this.sqlObj.data || {};
        const datastr = handleInsertData(newData);
        let result = `INSERT INTO ${this.sqlObj.table} ${datastr}`
        const sqlStr = result.replace(/'/g, '\'')

        this.sqlObj.sqlStr = sqlStr;
        return this;
    }

    // 批量插入
    insertMany(list: any[], type: boolean = false) {

    }

    /**
     * 删除
     */
    delete() {
        // delete必须有where
        if (isEmptyObj(this.sqlObj.where) || this.sqlObj.where === '') {
            return false;
        }

        this.sqlObj.queryType = 'delete';
        let result = `DELETE FROM ${this.sqlObj.table} WHERE ${this.sqlObj.where}`
        const sqlStr = result.replace(/'/g, '\'')
        this.sqlObj.sqlStr = sqlStr;
        return this;
    }

    /**
     * 原生sql查询
     * @param opt 
     * query('SELECT * FROM test')
     */
    query(opt: string) {
        opt = opt ? opt : '';

        this.sqlObj.sqlStr = opt;
        return this;
    }
}