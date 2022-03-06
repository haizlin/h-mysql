import { conf, sqlObj, tempObj } from './type/interface';
import { formatDate } from './uitl';
const mysql = require('mysql');

export default class Core {
    connection: any = null;
    config: conf;
    sqlObj: sqlObj = {};
    tempObj: tempObj = {};

    constructor(config: conf) {
        this.config = config;
        this.connect()
    }

    /**
     * 数据库连接
     */
    connect() {
        
        let conf = this.config;

        if (conf.isPool) {
            this.connection = mysql.createPool(conf);

            this.poolEvent();
        } else {
            this.connection = mysql.createConnection(conf);
        }
    }

    poolEvent() {
        // this.connection.on('acquire', function (connection) {
        //     console.log('Connection %d acquired', connection.threadId);
        // });

        // this.connection.on('release', function (connection) {
        //     console.log('Connection %d released', connection.threadId);
        // });

        // this.connection.on('enqueue', function () {
        //     console.log('Waiting for available connection slot');
        // });

        // this.connection.on('connection', function (connection) {
        //     connection.query('SET SESSION auto_increment_increment=1')
        // });
    }

    async execSql(isDebug: boolean = false, type: boolean = false) {
        
        let _this = this;
        let sqlstring: string = '';
        let isSingle = this.sqlObj.queryType === 'find'; // 是否是单条
        let isCount = this.sqlObj.field && this.sqlObj.field.toUpperCase().indexOf('COUNT(') > -1 && this.sqlObj.queryType === 'find';  // 是否为count

        if (this instanceof Core) {
            sqlstring = this.sqlObj.sqlStr;
            this.tempObj = this.config.isDebug ? this.sqlObj : {};
        }

        if (isDebug) {
            return { error: 0, result: this.tempObj };
        }

        this.sqlObj = {};

        return new Promise((resolve, reject) => {
            if (!_this.connection) {
                reject('请先初始化mysql');
                return false;
            }

            // _this.connection.query(sqlstring, (error: any, result: any, fields: any) => {
            //     if (error) {
            //         reject(error);
            //     } else {
            //         let r: any;
            //         let err: any = error === null ? 0 : error;

            //         if (isSingle) {
            //             r = result.length > 0 ? result[0] : {};
            //         } else {
            //             r = result;
            //         }

            //         if (isCount) {
            //             r = result[0]['total'] || 0;
            //         }

            //         resolve({ error: err, result: r });
            //     }

            //     if (!_this.config.isPool && !type) _this.connection.end();
            // });
            let pre_time = new Date().getTime();
            _this.connection.getConnection((err, connection) => {
                if(err){
                    console.log('mysql error:', err)
                    resolve(err);
                    return;
                }

                let connect_time = new Date().getTime();
                connection.query(sqlstring, (error: any, result: any, fields: any) => {
                    // _this.connection.releaseConnection(connection); // 释放连接
                    connection.release();
                    // connection.releaseConnection(); // 释放连接

                    let post_time = new Date().getTime();
                    let duration_1 = connect_time - pre_time; // 连接时间
                    let duration_2 = post_time - connect_time; // 查询时间
                    let duration_3 = post_time - pre_time; // 总时间
                    
                    console.log(formatDate('YYYY-mm-dd HH:MM:SS', new Date()) + ' | ' + `${duration_1}ms-${duration_2}ms-${duration_3}ms` + ' | ', sqlstring);

                    if (error) {
                        reject(error);
                    } else {
                        let r: any;
                        let err: any = error === null ? 0 : error;

                        if (isSingle) {
                            r = result.length > 0 ? result[0] : {};
                        } else {
                            r = result;
                        }

                        if (isCount) {
                            r = result[0] && result[0]['total'] || 0;
                        }
                        
                        resolve({ error: err, result: r });
                    }
                    
                    // connection.destroy();
                    
                    // connection.destroy();
                    // if (!_this.config.isPool && !type) _this.connection.end();
                });
            });
        })
    }

    async transaction(sqlstringArr: any[] = []) {
        let _this = this;

        return new Promise(async function (resolve, reject) {
            if (!_this.connection) {
                reject('请先初始化mysql');
                return false;
            }
            if (!sqlstringArr || !sqlstringArr.length) {
                reject('The parameter is empty.');
                return false;
            }
            await _this.execSql('start transaction;', true)
            let resuarr = []
            for (let i = 0, len = sqlstringArr.length; i < len; i++) {
                try {
                    let result = await _this.execSql(sqlstringArr[i], true)
                    resuarr.push(result)
                } catch (err) {
                    await _this.execSql('rollback;', true)
                    if (!_this.config.isPool) _this.connection.end()
                    reject(err)
                    return
                }
            }
            if (resuarr.length == sqlstringArr.length) {
                await _this.execSql('commit;', true)
                if (!_this.config.isPool) _this.connection.end()
                resolve(resuarr)
            } else {
                await _this.execSql('rollback;', true)
                if (!_this.config.isPool) _this.connection.end()
                reject(resuarr)
            }
        })
    }

}