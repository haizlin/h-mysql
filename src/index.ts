
import Core from './core';
import Base from './base';
import Curd from './curd';
import Database from './core';
import {conf} from './type/interface';
import {mixin} from './uitl';

function getConfig(config:conf){
    return config = {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'root',
        database: 'test',
        
        // pool
        acquireTimeout: 10000,
        waitForConnections: true,  
        connectionLimit: 10,  
        queueLimit: 0, 

        // 非数据库配置
        isPool: true,
        defaultSqlPre: '', // 前缀
        isDebug: true,
        
        ...config
    };
}

export default class hMysql extends mixin(Core, Base, Curd, Database) {
    constructor(config:conf){
        let conf = getConfig(config);

        super(conf);
        Base.new(conf);
        Curd.new(conf);
        Database.new(conf);
    }
}
