import { conf, sqlObj, tempObj } from './type/interface';
const mysql = require('mysql2');

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
        // 分离自定义配置，只把 mysql2 认识的连接配置传给 createPool/createConnection
        const { isPool, isDebug, defaultSqlPre, ...dbConfig } = this.config;

        if (isPool) {
            this.connection = mysql.createPool(dbConfig);

            this.poolEvent();
        } else {
            this.connection = mysql.createConnection(dbConfig);
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

    async execSql(ctx: any, isDebug = false) {

        let _this = this;
        let sqlstring: string = '';
        let values: any[] | undefined = undefined;
        let isSingle = this.sqlObj.queryType === 'find'; // 是否是单条
        let isCount = this.sqlObj.field && this.sqlObj.field.toUpperCase().indexOf('COUNT(') > -1 && this.sqlObj.queryType === 'find';  // 是否为count

        if (this instanceof Core) {
            sqlstring = this.sqlObj.sqlStr;
            if (this.sqlObj.usePlaceholder && Array.isArray(this.sqlObj.values)) {
                values = this.sqlObj.values;
            }
        }

        if (isDebug) {
            return { error: 0, result: this.tempObj };
        }

        // ========== 安全审计：占位符与 values 一致性 ==========
        // 目的：杜绝 "SQL 里有 ? 但 values 缺失" 这种导致 mysql2 抛 named-placeholders 错误的崩溃。
        if (typeof sqlstring === 'string' && sqlstring.length > 0) {
            // 在字符串字面量（'...' 或 "..."）外面的 ? 数量
            let placeholderCount = this._countPlaceholders(sqlstring);
            if (placeholderCount > 0) {
                if (!values || values.length === 0) {
                    // 拼成可读错误信息，抛错而不是静默崩溃
                    let err = new Error(
                        '[h-mysql] SQL 包含 ' + placeholderCount + ' 个 ? 占位符，但没有提供 values 参数。\n' +
                        '请使用 query(sql, [values]) 形式，或将占位符值用 mysql.escape() 内联。\n' +
                        'SQL: ' + sqlstring
                    );
                    throw err;
                }
                if (values.length !== placeholderCount) {
                    let err = new Error(
                        '[h-mysql] SQL 中 ? 占位符个数(' + placeholderCount + ') 与 values 长度(' + values.length + ') 不匹配。\n' +
                        'SQL: ' + sqlstring
                    );
                    throw err;
                }
            }
            // 警告：命名占位符 (:name) 在 h-mysql 中不支持（链式所有数据都内联为字符串字面量）
            // 如果 SQL 中出现 :xxx 模式且不在字符串字面量内，阻断警告
            if (this._containsNamedPlaceholder(sqlstring)) {
                let err = new Error(
                    '[h-mysql] 不支持命名占位符 (:name) 语法。h-mysql 的设计是所有值通过 mysql.escape() 内联或 ? 占位符处理。\n' +
                    '如有 JSON 字符串含 :xxx 误识别，请改用 mysql.escape() 转义后再拼接。\n' +
                    'SQL: ' + sqlstring
                );
                throw err;
            }
        }

        this.sqlObj = {};

        return new Promise((resolve, reject) => {
            if (!_this.connection) {
                reject('请先初始化mysql');
                return false;
            }

            let pre_time = new Date().getTime();
            _this.connection.getConnection((err, connection) => {
                if (err) {
                    console.log('mysql error:', err);
                    reject(err);  // 修复：连接错误统一 reject，而不是 resolve(err)
                    return;
                }

                let connect_time = new Date().getTime();
                // 修复：传入 values 以支持 ? 占位符
                let queryCallback = (error: any, result: any, fields: any) => {
                    // _this.connection.releaseConnection(connection); // 释放连接
                    connection.release();
                    // connection.releaseConnection(); // 释放连接

                    let post_time = new Date().getTime();
                    let duration_1 = connect_time - pre_time; // 连接时间
                    let duration_2 = post_time - connect_time; // 查询时间
                    let duration_3 = post_time - pre_time; // 总时间

                    // console.log(formatDate('YYYY-mm-dd HH:MM:SS', new Date()) + ' | ' + `${duration_1}ms-${duration_2}ms-${duration_3}ms` + ' | ', sqlstring);

                    // 累加数据库性能统计
                    if (ctx && ctx.perfStats) {
                        ctx.perfStats.dbQueries += 1;
                        ctx.perfStats.dbDuration += duration_3;
                    }

                    let logInfo = {
                        type: '[SQL Exec]',
                        traceId: (ctx && ctx.traceId) ? ctx.traceId : '',
                        '@timestamp': new Date().toISOString(),
                        connectMs: duration_1,
                        queryMs: duration_2,
                        totalMs: duration_3,
                        sql: sqlstring.trim(),
                        values: values ? '[' + values.length + ' params]' : undefined
                    };
                    console.log(JSON.stringify(logInfo));

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
                };
                if (values && values.length > 0) {
                    connection.query(sqlstring, values, queryCallback);
                } else {
                    connection.query(sqlstring, queryCallback);
                }
            });
        })
    }

    /**
     * 统计 SQL 中 ? 占位符数量（排除字符串字面量内部的 ?）
     */
    _countPlaceholders(sql: string): number {
        let count = 0;
        let len = sql.length;
        let i = 0;
        let inSingleQuote = false;
        let inDoubleQuote = false;
        let inBacktick = false;
        let prevChar = '';
        while (i < len) {
            let ch = sql[i];
            if (ch === '\\' && (inSingleQuote || inDoubleQuote)) {
                i += 2;
                continue;
            }
            if (!inDoubleQuote && !inBacktick && ch === "'") {
                inSingleQuote = !inSingleQuote;
            } else if (!inSingleQuote && !inBacktick && ch === '"') {
                inDoubleQuote = !inDoubleQuote;
            } else if (!inSingleQuote && !inDoubleQuote && ch === '`') {
                inBacktick = !inBacktick;
            } else if (!inSingleQuote && !inDoubleQuote && !inBacktick && ch === '?') {
                count++;
            }
            prevChar = ch;
            i++;
        }
        return count;
    }

    /**
     * 检测 SQL 中是否含有命名占位符 :xxx 模式（排除字符串字面量内部）
     * 命名占位符是 mysql2 的 named-placeholders 插件语义，不是 h-mysql 的设计
     */
    _containsNamedPlaceholder(sql: string): boolean {
        let len = sql.length;
        let i = 0;
        let inSingleQuote = false;
        let inDoubleQuote = false;
        let inBacktick = false;
        while (i < len) {
            let ch = sql[i];
            if (ch === '\\' && (inSingleQuote || inDoubleQuote)) {
                i += 2;
                continue;
            }
            if (!inDoubleQuote && !inBacktick && ch === "'") {
                inSingleQuote = !inSingleQuote;
            } else if (!inSingleQuote && !inBacktick && ch === '"') {
                inDoubleQuote = !inDoubleQuote;
            } else if (!inSingleQuote && !inDoubleQuote && ch === '`') {
                inBacktick = !inBacktick;
            } else if (!inSingleQuote && !inDoubleQuote && !inBacktick && ch === ':') {
                // 检查是否后面跟着字母/下划线（命名占位符特征）
                let next = sql[i + 1];
                if (next && /[a-zA-Z_]/.test(next)) {
                    return true;
                }
            }
            i++;
        }
        return false;
    }

    /**
     * 事务执行（按参数类型分流）
     * - 传入回调函数（推荐用法）：在连接池的专用连接上执行，beginTransaction/commit/rollback 自动管理，
     *   回调收到 promise 风格的 tQuery(sql, values)，任一语句抛错自动回滚，回调返回值作为事务结果
     * - 传入 SQL 语句数组（旧用法，兼容保留）：注意池模式下每条语句可能落在不同连接，事务不保证同一会话，不推荐
     * @example
     *   // 推荐用法：多条语句在同一专用连接上原子执行
     *   const result = await mysql.transaction(async (t) => {
     *       await t.query('UPDATE a SET x=? WHERE id=?', [1, 10]);
     *       await t.query('INSERT INTO b(name) VALUES(?)', ['test']);
     *       return { ok: 1 };
     *   });
     *   // 旧用法（兼容保留，不推荐）
     *   await mysql.transaction(['UPDATE a SET x=1', 'UPDATE b SET y=2']);
     */
    async transaction(arg: any = null) {
        if (typeof arg === 'function') {
            return this.transactByConnection(arg);
        }
        return this.transactionBySqlArr(arg);
    }

    /**
     * 在连接池的专用连接上执行事务（连接持有期间所有语句处于同一会话）
     * 池模式取专用连接执行完毕后归还；非池模式直接用唯一连接（单连接天然同会话）
     * @param handler 回调 (tQuery, connection) => Promise，tQuery(sql, values) 返回 promise，抛错自动回滚
     */
    transactByConnection(handler: Function) {
        let _this = this;

        // 事务节点日志：便于排查连接获取/事务开启/回滚阶段的失败（这些阶段无 SQL 执行日志）
        const transLog = (stage: string, extra: any = {}) => {
            console.log(JSON.stringify(Object.assign({
                type: '[SQL Trans]',
                stage: stage,
                '@timestamp': new Date().toISOString()
            }, extra)));
        };

        return new Promise((resolve, reject) => {
            if (!_this.connection) {
                reject(new Error('请先初始化mysql'));
                return;
            }

            const getConn = (cb: Function) => {
                if (_this.config.isPool) {
                    _this.connection.getConnection((err: any, conn: any) => cb(err, conn));
                } else {
                    cb(null, _this.connection);
                }
            };

            getConn((err: any, connection: any) => {
                if (err) {
                    transLog('获取连接失败', { error: String((err && err.message) || err) });
                    reject(err);
                    return;
                }

                let released = false;
                const releaseConn = () => {
                    if (released || !_this.config.isPool) return;
                    released = true;
                    try { connection.release(); } catch (e) { /* 忽略释放异常 */ }
                };

                // 事务内查询：支持 ? 占位符 + values，返回 promise
                // 兼容两种用法：await t(sql, values) 直接调用，或 await t.query(sql, values) 对象风格
                const tQuery: any = (sql: string, values?: any[]) => new Promise((res, rej) => {
                    let preTime = new Date().getTime();
                    const queryCallback = (qErr: any, result: any) => {
                        console.log(JSON.stringify({
                            type: '[SQL Trans]',
                            stage: 'query',
                            '@timestamp': new Date().toISOString(),
                            queryMs: new Date().getTime() - preTime,
                            sql: String(sql || '').trim(),
                            values: values ? '[' + values.length + ' params]' : undefined,
                            error: qErr ? String((qErr && qErr.message) || qErr) : undefined
                        }));
                        if (qErr) {
                            rej(qErr);
                        } else {
                            res(result);
                        }
                    };
                    if (values && values.length > 0) {
                        connection.query(sql, values, queryCallback);
                    } else {
                        connection.query(sql, queryCallback);
                    }
                });
                // 函数对象挂载自身为 query 属性，兼容 t.query(sql, values) 对象风格调用
                tQuery.query = tQuery;

                connection.beginTransaction((txErr: any) => {
                    if (txErr) {
                        transLog('开启事务失败', { error: String((txErr && txErr.message) || txErr) });
                        releaseConn();
                        reject(txErr);
                        return;
                    }
                    (async () => {
                        try {
                            const result = await handler(tQuery, connection);
                            connection.commit((cErr: any) => {
                                releaseConn();
                                if (cErr) {
                                    transLog('提交事务失败', { error: String((cErr && cErr.message) || cErr) });
                                    reject(cErr);
                                } else {
                                    transLog('事务已提交');
                                    resolve(result);
                                }
                            });
                        } catch (e) {
                            transLog('执行失败并回滚', { error: String((e && e.message) || e), stack: (e && e.stack) ? String(e.stack).split('\n').slice(0, 3).join(' | ') : undefined });
                            connection.rollback(() => {
                                releaseConn();
                                reject(e);
                            });
                        }
                    })();
                });
            });
        });
    }

    async transactionBySqlArr(sqlstringArr: any[] = []) {
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