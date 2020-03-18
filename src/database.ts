/**
 * 数据库的常用操作
 */
import {
    sortSelectSql
} from './uitl'
import { conf, sqlObj } from './type/interface';

export default class Database {
    config: conf;
    sqlObj: sqlObj = {};

    constructor(config: conf) {
        this.config = config;
    }

    // 创建数据表
    create(flag: boolean = false) {
        
    }

    // 清空数据表
    clear(){
        
    }
}