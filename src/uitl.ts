import sqlstring from 'sqlstring'
import { sqlObj } from './type/interface';
const mysql = require('mysql');

// 时间格式化
export function formatDate(fmt: string, date: any) {
    let ret;
    const opt = {
        "Y+": date.getFullYear().toString(),        // 年
        "m+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "H+": date.getHours().toString(),           // 时
        "M+": date.getMinutes().toString(),         // 分
        "S+": date.getSeconds().toString()          // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        };
    };
    return fmt;
}


//把查询条件转换为string
export function getWhereToString(opt: any) {
    let result = ''

    if (isType(opt, 'object')) {
        let _type = opt._type && opt._type.toUpperCase() || 'AND'
        let number = opt._type && opt._type.trim() ? 1 : 0
        let keys = Object.keys(opt);

        keys.forEach((item, index) => {
            if (item === '_type') return;

            if (isType(opt[item], 'object')) {
                result += `${checkObjType(item, opt[item])}` + ((index === keys.length - 1 - number) ? ' ' : ` ${_type} `);
            } else {
                result += `${item}=${mysql.escape(checkType(opt[item]))}` + ((index === keys.length - 1 - number) ? ' ' : ` ${_type} `)
            }
        })
    } else if (isType(opt, 'array')) {
        opt.forEach((item, index) => {
            let result1 = ''
            let number = 0
            let _type = item._type && item._type.toUpperCase() || 'AND'
            let _nexttype = item._nexttype || 'AND'
            number = item._type && item._type.trim() ? number + 1 : number
            number = item._nexttype && item._nexttype.trim() ? number + 1 : number

            let keys = Object.keys(item)
            keys.forEach((chi_item, index) => {
                if (chi_item === '_type' || chi_item === '_nexttype') return;
                if (result1) {
                    if (isType(item[chi_item], 'object')) {
                        result1 += `${_type} ${checkObjType(chi_item, item[chi_item])}`
                    } else {
                        result1 += `${_type} ${chi_item}=${checkType(item[chi_item])} `
                    }
                } else {
                    if (isType(item[chi_item], 'object')) {
                        result1 = `${checkObjType(chi_item, item[chi_item])}`
                    } else {
                        result1 = `${chi_item}=${mysql.escape(checkType(item[chi_item]))} `
                    }
                }
            })

            index === opt.length - 1 ?
                result1 = `(${result1})` :
                result1 = `(${result1}) ${_nexttype.toUpperCase()}`

            result = `${result} ${result1}`
        })
    }
    return result
}

//检查值类型返回相应值
export function checkType(opt: any, key?: string) {
    let result: any;

    if (isType(opt, 'string')) {
        // opt = sqlstring.escape(opt.trim());
        opt = opt.trim();

        // result = opt.indexOf(key) > -1 && opt.match(/\+|-|\*|\/|%/) ? opt.slice(1, -1) : opt;
        result = opt;
    } else if (isType(opt, 'boolean') || isType(opt, 'number')) {
        result = opt
    } else {
        // result = sqlstring.escape(opt);
        result = opt;
    }

    return result
}

//检查object值类型 返回相应值
export function checkObjType(pre_key: string, val: any) {
    let result = ''

    if (isType(val, 'object')) {
        let keys = Object.keys(val)
        let number = val._type && val._type.trim() ? 1 : 0

        keys.forEach((item, index) => {
            if (item === '_type') return;

            let _type = val._type || 'AND'
            result = result + expressionQuery(
                pre_key,
                item,
                val[item],
                _type.toUpperCase(),
                index === keys.length - 1 - number ? true : false
            )
        })
    } else {
        result = `${pre_key}=${val}`
    }
    return `(${result}) `
}

// 表达式匹配查询
export function expressionQuery(par_key: string, mark: string, value: any, _type: string, isLastOne: boolean) {
    let result = '';
    let str: string = '';

    switch (mark.toUpperCase()) {
        case 'EQ':
            result = `(${par_key}='${checkType(value)}')`
            break;
        case 'NEQ':
            result = `(${par_key}<>'${checkType(value)}')`
            break;
        case 'GT':
            result = `(${par_key}>'${checkType(value)}')`
            break;
        case 'EGT':
            result = `(${par_key}>='${checkType(value)}')`
            break;
        case 'LT':
            result = `(${par_key}<'${checkType(value)}')`
            break;
        case 'ELT':
            result = `(${par_key}<='${checkType(value)}')`
            break;
        case 'LIKE':
            result = `(${par_key} LIKE '${checkType(value)}')`
            break;
        case 'NOTLIKE':
            result = `(${par_key} NOT LIKE '${checkType(value)}')`
            break;
        case 'BETWEEN':
            result = `(${par_key} BETWEEN ${value.replace(',', ' AND ')})`
            break;
        case 'NOTBETWEEN':
            result = `(${par_key} NOT BETWEEN ${value.replace(',', ' AND ')})`
            break;
        case 'IN':
            if (isType(value, 'array')) {
                value.map((v, i) => {
                    let flag = i !== (value.length - 1) ? ',' : '';
                    str += "'" + v + "'" + flag;
                });
            } else {
                str = value;
            }

            result = `(${par_key} IN (${str}))`
            break;

        case 'NOTIN':
            if (isType(value, 'array')) {
                value.map((v, i) => {
                    let flag = i !== (value.length - 1) ? ',' : '';
                    str += "'" + v + "'" + flag;
                });
            } else {
                str = value;
            }

            result = `(${par_key} NOT IN (${str}))`
            break;
        case 'OR':
            if (isType(value, 'array')) {
                value.map((v, i) => {
                    let flag = i !== (value.length - 1) ? ',' : '';
                    str += "'" + v + "'" + flag;
                });
            } else {
                str = value;
            }

            result = `(${par_key} OR (${str}))`
            break;
        case 'ISNULL':
            result = `(${par_key} IS NULL )`
            break;
        case 'ISNOTNULL':
            result = `(${par_key} IS NOT NULL )`
            break;
        default:
            result = `(${par_key}=${checkType(value)})`
    }
    return isLastOne ? `${result} ` : `${result} ${_type} `
}

//排序 生成 sql 字符串
export function sortSelectSql(result: sqlObj = {}) {
    if (result.count || result.distinct || result.max || result.min || result.avg || result.sum) {
        let concatstr = (result.count ? `,${result.count}` : '')
            + (result.distinct ? `,${result.distinct}` : '')
            + (result.max ? `,${result.max}` : '')
            + (result.min ? `,${result.min}` : '')
            + (result.avg ? `,${result.avg}` : '')
            + (result.sum ? `,${result.sum}` : '')

        result.count = result.distinct = result.max = result.min = result.avg = result.sum = '';
        result.field ? result.field = (result.field + concatstr) : result.field = concatstr.substring(1)
    } else {
        result.field = _formatFieldsName(result.field, result.alias, result.table);
    }

    if (result.table) result.table = `FROM ${result.table}` + (result.alias ? ' AS ' : '');
    if (result.join) result.join = `${result.join}`
    if (result.where) result.where = `WHERE ${result.where}`

    let keys = Object.keys(result)
    let keysresult: any[] = []
    // 查询默认排序数组
    let searchSort = ['union', 'distinct', 'field', 'count', 'max', 'min', 'avg', 'sum', 'table',
        'alias', 'join', 'like', 'where', 'group', 'having', 'order', 'limit', 'page', 'comment']
    //排序                    
    keys.forEach((v, i) => {
        searchSort.forEach((item, index) => {
            if (v === item) {
                keysresult[index] = v
            }
        })
    })
    return {
        sortkeys: keysresult,
        result: result
    };
}

function sortArray(data: any[]) {
    const result = [];
    const item = Object.keys(data[0])
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < item.length; j++) {
            if (!Object.keys(data[i]).includes(item[j])) {
                item.splice(j, 1);
            }
        }
    }
    for (let i = 0; i < data.length; i++) {
        let json = {};
        for (let j = 0; j < item.length; j++) {
            json[[item[j]]] = data[i][item[j]];
        }
        result.push(json)
    }
    return result;
}

// 处理insert批量插入data参数
export function insertData(data: any) {
    if (!data) return '';
    if (Array.isArray(data) && data.length === 0) {
        return '';
    }
    if (Array.isArray(data) && data.length === 1) {
        data = data[0];
    }

    let keys = ''
    let values = ''
    let datastr = ''

    if (Array.isArray(data)) {
        // array
        data = sortArray(data);
        keys = Object.keys(data[0]).toString();

        for (let i = 0; i < data.length; i++) {
            let items = ''
            for (let key in data[i]) {
                let v = checkType(data[i][key])
                items = items ? `${items},${v || "''"}` : `${v || "''"}`
            }
            values += `(${items}),`
        }
        values = values.slice(0, -1)
    } else {
        for (let key in data) {
            let v = checkType(data[key]);

            keys = keys ? `${keys},\`${key}\`` : `\`${key}\``
            values = values ? `${values}, ${v || "''"}` : `${v || "''"}`
        }
        values = `(${values})`;
    }
    datastr = `(${keys}) VALUES ${values}`;
    return datastr;
}

export function mix(...mixins) {
    class Mix {
        constructor(...ags) {
            for (let mixin of mixins) {
                copyProperties(this, new mixin(ags)); // 拷贝实例属性
            }
        }
    }

    for (let mixin of mixins) {
        copyProperties(Mix, mixin); // 拷贝静态属性
        copyProperties(Mix.prototype, mixin.prototype); // 拷贝原型属性
    }

    return Mix;
}

function copyProperties(target, source) {
    for (let key of Object.keys(source)) {
        if (key !== 'constructor'
            && key !== 'prototype'
            && key !== 'name'
        ) {
            let desc = Object.getOwnPropertyDescriptor(source, key);
            Object.defineProperty(target, key, desc);
        }
    }
}

export function mixin(base, ...mixins) {
    let copyProperties = function (target = {}, source = {}) {
        const ownPropertyNames = Object.getOwnPropertyNames(source);

        ownPropertyNames
            .filter(key => !/(prototype|name|constructor)/.test(key))
            .forEach(key => {
                const desc = Object.getOwnPropertyDescriptor(source, key);
                Object.defineProperty(target, key, desc);
            });
    };

    let copyFunctions = function (target = {}, source = {}, bindto) {
        const ownPropertyNames = Object.getOwnPropertyNames(source);

        ownPropertyNames
            .filter(key => !/(prototype|name|constructor)/.test(key))
            .filter(key => source[key] instanceof Function)
            .forEach(key => {
                target[key] = source[key].bind(bindto);
            });
    };

    let retval = class VirtualBase extends base {
        constructor(...args) {
            super(...args);

            this.mixed = {};
            let that = this;

            for (let i in mixins) {
                let handler = {
                    apply: function (target, thisobj, arglist) {
                        copyProperties(that, mixins[i].prototype);
                        copyFunctions(that.mixed, mixins[i].prototype, that);
                        let obj = new mixins[i](...arglist);
                        copyProperties(that, obj);
                        copyFunctions(that.mixed, obj, that);
                    }
                }

                let p = new Proxy(mixins[i], handler);
                mixins[i].new = p;

                let desc = Object.getOwnPropertyDescriptor(mixins[i], Symbol.hasInstance);

                if (!desc || desc.writable) {
                    let original_instanceof = mixins[i][Symbol.hasInstance];

                    Object.defineProperty(mixins[i], Symbol.hasInstance, {
                        //   value: (o) => original_instanceof(o) || o instanceof VirtualBase || mixins[i].prototype.isPrototypeOf(o),
                        value: (o) => original_instanceof(o) || mixins[i].prototype.isPrototypeOf(o),
                        writable: true
                    });
                }
            }

            this.isMixedWith = (cl) => mixins.reduce(
                (p, c) => p || (cl === c || cl.isPrototypeOf(c)), false);
        }
    };

    return retval;
}

/**
   * 需要选择的字段名处理
   * @private
   * @return {string} 需要选择的字段拼接结果
   */
export function _formatFields(field: string) {
    let res = '';
    let tempArr = [];

    if (field.indexOf(' as') > -1) {
        tempArr = field.split(' as ');
        res = '`' + tempArr[0] + '` as ' + tempArr[1];
    } else {
        return '`' + field + '`';
    }

    return res;
}

/**
   * 字段名处理，添加``，防止报错
   * @private
   * @param {string} field 字段名
   */
export function _formatFieldsName(field: string | any[], tableAlias: string, tableName: string) {
    let table = tableAlias || tableName;
    let fieldName = '';
    let fieldArr: any[] = [];

    if (!field) {
        return fieldName = '*';
    }

    if (isType(field, 'string')) {
        fieldArr = field.split(',');
        fieldArr.forEach((v, i) => fieldArr[i] = v.trim());
    } else {
        fieldArr = field;
    }

    for (let i = 0; i < fieldArr.length; i++) {
        let item = fieldArr[i];
        let comm = (i === fieldArr.length - 1 ? '' : ',');

        if (item.indexOf('count(') > -1) {
            fieldName += item + comm;
        } else if (item.indexOf('.') > -1) {
            fieldName += item + comm;
        } else {
            fieldName += (tableAlias ? (table + '.' + _formatFields(item)) : item) + comm;
        }
    }

    return fieldName;
}

export function isEmptyObj(obj: object) {
    for (let attr in obj) {
        return false;
    }

    return true;
}

export function isType(str: any, type: string) {
    return (Object.prototype.toString.call(str).slice(8, -1)).toLocaleLowerCase() === type.toLocaleLowerCase();
}

/**
   * join操作
   * @private
   * @return {string} 
   */
export function formatJoin(join: Object, tableAlias: string, tableName: string) {
    if (isEmptyObj(join)) {
        return '';
    }

    let joinStr = '';
    const mainTable = tableAlias || tableName;

    for (const i in join) {
        const item = join[i];
        const joinType = item.type ? item.type.toLocaleUpperCase() : 'LEFT';
        joinStr += ' ' + joinType + ' JOIN ' + i;
        joinStr += item.as ? ' AS ' + item.as : '';
        joinStr += ' ON (';

        const tmpArr = [];
        const subTable = item.as ? item.as : i;
        for (const index in item.on) {
            if (isType(item.on, 'string')) {
                tmpArr.push(item.on);
            } else {
                tmpArr.push('`' + mainTable + '`.`' + index + '`=`' + subTable + '`.`' + item.on[index] + '`');
            }
        }
        joinStr += tmpArr.join(' AND ') + ')';
    }
    return joinStr;
}


