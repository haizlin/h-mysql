/**
 * h-mysql v1.0.27
 * (c) 2018-2025 haizlin https://github.com/haizlin/h-mysql
 * Licensed MIT
 * Released on: February 1, 2018
 */

'use strict';

const mysql$2 = require('mysql2');

function formatDate(fmt, date) {
  let ret;
  const opt = {
    "Y+": date.getFullYear().toString(),
    "m+": (date.getMonth() + 1).toString(),
    "d+": date.getDate().toString(),
    "H+": date.getHours().toString(),
    "M+": date.getMinutes().toString(),
    "S+": date.getSeconds().toString()
  };

  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);

    if (ret) {
      fmt = fmt.replace(ret[1], ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, "0"));
    }
  }
  return fmt;
}
function getWhereToString(opt) {
  let result = '';

  if (isType(opt, 'object')) {
    let _type = opt._type && opt._type.toUpperCase() || 'AND';

    let number = opt._type && opt._type.trim() ? 1 : 0;
    let keys = Object.keys(opt);
    keys.forEach((item, index) => {
      if (item === '_type') return;

      if (isType(opt[item], 'object')) {
        result += `${checkObjType(item, opt[item])}` + (index === keys.length - 1 - number ? ' ' : ` ${_type} `);
      } else {
        result += `${item}=${mysql$2.escape(checkType(opt[item]))}` + (index === keys.length - 1 - number ? ' ' : ` ${_type} `);
      }
    });
  } else if (isType(opt, 'array')) {
    opt.forEach((item, index) => {
      let result1 = '';
      let number = 0;

      let _type = item._type && item._type.toUpperCase() || 'AND';

      let _nexttype = item._nexttype || 'AND';

      number = item._type && item._type.trim() ? number + 1 : number;
      number = item._nexttype && item._nexttype.trim() ? number + 1 : number;
      let keys = Object.keys(item);
      keys.forEach((chi_item, index) => {
        if (chi_item === '_type' || chi_item === '_nexttype') return;

        if (result1) {
          if (isType(item[chi_item], 'object')) {
            result1 += `${_type} ${checkObjType(chi_item, item[chi_item])}`;
          } else {
            result1 += `${_type} ${chi_item}=${mysql$2.escape(checkType(item[chi_item]))} `;
          }
        } else {
          if (isType(item[chi_item], 'object')) {
            result1 = `${checkObjType(chi_item, item[chi_item])}`;
          } else {
            result1 = `${chi_item}=${mysql$2.escape(checkType(item[chi_item]))} `;
          }
        }
      });
      index === opt.length - 1 ? result1 = `(${result1})` : result1 = `(${result1}) ${_nexttype.toUpperCase()}`;
      result = `${result} ${result1}`;
    });
  }

  return result;
}
function checkType(opt, key) {
  let result;

  if (isType(opt, 'string')) {
    opt = opt.trim();
    result = opt;
  } else if (isType(opt, 'boolean') || isType(opt, 'number')) {
    result = opt;
  } else {
    result = opt;
  }

  return result;
}
function checkObjType(pre_key, val) {
  let result = '';

  if (isType(val, 'object')) {
    let keys = Object.keys(val);
    let number = val._type && val._type.trim() ? 1 : 0;
    keys.forEach((item, index) => {
      if (item === '_type') return;

      let _type = val._type || 'AND';

      result = result + expressionQuery(pre_key, item, val[item], _type.toUpperCase(), index === keys.length - 1 - number ? true : false);
    });
  } else {
    result = `${pre_key}=${val}`;
  }

  return `(${result}) `;
}
function expressionQuery(par_key, mark, value, _type, isLastOne) {
  let result = '';
  let str = '';

  switch (mark.toUpperCase()) {
    case 'EQ':
      result = `(${par_key}='${checkType(value)}')`;
      break;

    case 'NEQ':
      result = `(${par_key}<>'${checkType(value)}')`;
      break;

    case 'GT':
      result = `(${par_key}>'${checkType(value)}')`;
      break;

    case 'EGT':
      result = `(${par_key}>='${checkType(value)}')`;
      break;

    case 'LT':
      result = `(${par_key}<'${checkType(value)}')`;
      break;

    case 'ELT':
      result = `(${par_key}<='${checkType(value)}')`;
      break;

    case 'LIKE':
      result = `(${par_key} LIKE '${checkType(value)}')`;
      break;

    case 'NOTLIKE':
      result = `(${par_key} NOT LIKE '${checkType(value)}')`;
      break;

    case 'BETWEEN':
      result = `(${par_key} BETWEEN ${value.replace(',', ' AND ')})`;
      break;

    case 'NOTBETWEEN':
      result = `(${par_key} NOT BETWEEN ${value.replace(',', ' AND ')})`;
      break;

    case 'IN':
      if (isType(value, 'array')) {
        value.map((v, i) => {
          let flag = i !== value.length - 1 ? ',' : '';
          str += "'" + v + "'" + flag;
        });
      } else {
        str = value;
      }

      result = `(${par_key} IN (${str}))`;
      break;

    case 'NOTIN':
      if (isType(value, 'array')) {
        value.map((v, i) => {
          let flag = i !== value.length - 1 ? ',' : '';
          str += "'" + v + "'" + flag;
        });
      } else {
        str = value;
      }

      result = `(${par_key} NOT IN (${str}))`;
      break;

    case 'OR':
      if (isType(value, 'array')) {
        value.map((v, i) => {
          let flag = i !== value.length - 1 ? ',' : '';
          str += "'" + v + "'" + flag;
        });
      } else {
        str = value;
      }

      result = `(${par_key} OR (${str}))`;
      break;

    case 'ISNULL':
      result = `(${par_key} IS NULL )`;
      break;

    case 'ISNOTNULL':
      result = `(${par_key} IS NOT NULL )`;
      break;

    default:
      result = `(${par_key}=${checkType(value)})`;
  }

  return isLastOne ? `${result} ` : `${result} ${_type} `;
}
function sortSelectSql(result = {}) {
  if (result.count || result.distinct || result.max || result.min || result.avg || result.sum) {
    let concatstr = (result.count ? `,${result.count}` : '') + (result.distinct ? `,${result.distinct}` : '') + (result.max ? `,${result.max}` : '') + (result.min ? `,${result.min}` : '') + (result.avg ? `,${result.avg}` : '') + (result.sum ? `,${result.sum}` : '');
    result.count = result.distinct = result.max = result.min = result.avg = result.sum = '';
    result.field ? result.field = result.field + concatstr : result.field = concatstr.substring(1);
  } else {
    result.field = _formatFieldsName(result.field, result.alias, result.table);
  }

  if (result.table) result.table = `FROM ${result.table}` + (result.alias ? ' AS ' : '');
  if (result.join) result.join = `${result.join}`;
  if (result.where) result.where = `WHERE ${result.where}`;
  let keys = Object.keys(result);
  let keysresult = [];
  let searchSort = ['union', 'distinct', 'field', 'count', 'max', 'min', 'avg', 'sum', 'table', 'alias', 'join', 'like', 'where', 'group', 'having', 'order', 'limit', 'page', 'comment'];
  keys.forEach((v, i) => {
    searchSort.forEach((item, index) => {
      if (v === item) {
        keysresult[index] = v;
      }
    });
  });
  return {
    sortkeys: keysresult,
    result: result
  };
}

function sortArray(data) {
  const result = [];
  const item = Object.keys(data[0]);

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

    result.push(json);
  }

  return result;
}

function insertData(data) {
  if (!data) return '';

  if (Array.isArray(data) && data.length === 0) {
    return '';
  }

  if (Array.isArray(data) && data.length === 1) {
    data = data[0];
  }

  let keys = '';
  let values = '';
  let datastr = '';

  if (Array.isArray(data)) {
    data = sortArray(data);
    keys = Object.keys(data[0]).toString();

    for (let i = 0; i < data.length; i++) {
      let items = '';

      for (let key in data[i]) {
        let v = checkType(data[i][key]);
        items = items ? `${items},${v || "''"}` : `${v || "''"}`;
      }

      values += `(${items}),`;
    }

    values = values.slice(0, -1);
  } else {
    for (let key in data) {
      let v = checkType(data[key]);
      keys = keys ? `${keys},\`${key}\`` : `\`${key}\``;
      values = values ? `${values}, ${v || "''"}` : `${v || "''"}`;
    }

    values = `(${values})`;
  }

  datastr = `(${keys}) VALUES ${values}`;
  return datastr;
}

function mixin(base, ...mixins) {
  let copyProperties = function (target = {}, source = {}) {
    const ownPropertyNames = Object.getOwnPropertyNames(source);
    ownPropertyNames.filter(key => !/(prototype|name|constructor)/.test(key)).forEach(key => {
      const desc = Object.getOwnPropertyDescriptor(source, key);
      Object.defineProperty(target, key, desc);
    });
  };

  let copyFunctions = function (target = {}, source = {}, bindto) {
    const ownPropertyNames = Object.getOwnPropertyNames(source);
    ownPropertyNames.filter(key => !/(prototype|name|constructor)/.test(key)).filter(key => source[key] instanceof Function).forEach(key => {
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
        };
        let p = new Proxy(mixins[i], handler);
        mixins[i].new = p;
        let desc = Object.getOwnPropertyDescriptor(mixins[i], Symbol.hasInstance);

        if (!desc || desc.writable) {
          let original_instanceof = mixins[i][Symbol.hasInstance];
          Object.defineProperty(mixins[i], Symbol.hasInstance, {
            value: o => original_instanceof(o) || mixins[i].prototype.isPrototypeOf(o),
            writable: true
          });
        }
      }

      this.isMixedWith = cl => mixins.reduce((p, c) => p || cl === c || cl.isPrototypeOf(c), false);
    }

  };
  return retval;
}
function _formatFields(field) {
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
function _formatFieldsName(field, tableAlias, tableName) {
  let table = tableAlias || tableName;
  let fieldName = '';
  let fieldArr = [];

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
    let comm = i === fieldArr.length - 1 ? '' : ',';

    if (item.indexOf('count(') > -1) {
      fieldName += item + comm;
    } else if (item.indexOf('.') > -1) {
      fieldName += item + comm;
    } else {
      fieldName += (tableAlias ? table + '.' + _formatFields(item) : item) + comm;
    }
  }

  return fieldName;
}
function isEmptyObj(obj) {
  for (let attr in obj) {
    return false;
  }

  return true;
}
function isType(str, type) {
  return Object.prototype.toString.call(str).slice(8, -1).toLocaleLowerCase() === type.toLocaleLowerCase();
}
function formatJoin(join, tableAlias, tableName) {
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

const mysql$1 = require('mysql2');

class Core {
  constructor(config) {
    this.connection = null;
    this.sqlObj = {};
    this.tempObj = {};
    this.config = config;
    this.connect();
  }

  connect() {
    let conf = this.config;

    if (conf.isPool) {
      this.connection = mysql$1.createPool(conf);
      this.poolEvent();
    } else {
      this.connection = mysql$1.createConnection(conf);
    }
  }

  poolEvent() {}

  async execSql(isDebug = false, type = false) {
    let _this = this;

    let sqlstring = '';
    let isSingle = this.sqlObj.queryType === 'find';
    let isCount = this.sqlObj.field && this.sqlObj.field.toUpperCase().indexOf('COUNT(') > -1 && this.sqlObj.queryType === 'find';

    if (this instanceof Core) {
      sqlstring = this.sqlObj.sqlStr;
      this.tempObj = this.config.isDebug ? this.sqlObj : {};
    }

    if (isDebug) {
      return {
        error: 0,
        result: this.tempObj
      };
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
          resolve(err);
          return;
        }

        let connect_time = new Date().getTime();
        connection.query(sqlstring, (error, result, fields) => {
          connection.release();
          let post_time = new Date().getTime();
          let duration_1 = connect_time - pre_time;
          let duration_2 = post_time - connect_time;
          let duration_3 = post_time - pre_time;
          console.log(formatDate('YYYY-mm-dd HH:MM:SS', new Date()) + ' | ' + `${duration_1}ms-${duration_2}ms-${duration_3}ms` + ' | ', sqlstring);

          if (error) {
            reject(error);
          } else {
            let r;
            let err = error === null ? 0 : error;

            if (isSingle) {
              r = result.length > 0 ? result[0] : {};
            } else {
              r = result;
            }

            if (isCount) {
              r = result[0] && result[0]['total'] || 0;
            }

            resolve({
              error: err,
              result: r
            });
          }
        });
      });
    });
  }

  async transaction(sqlstringArr = []) {
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

      await _this.execSql('start transaction;', true);
      let resuarr = [];

      for (let i = 0, len = sqlstringArr.length; i < len; i++) {
        try {
          let result = await _this.execSql(sqlstringArr[i], true);
          resuarr.push(result);
        } catch (err) {
          await _this.execSql('rollback;', true);
          if (!_this.config.isPool) _this.connection.end();
          reject(err);
          return;
        }
      }

      if (resuarr.length == sqlstringArr.length) {
        await _this.execSql('commit;', true);
        if (!_this.config.isPool) _this.connection.end();
        resolve(resuarr);
      } else {
        await _this.execSql('rollback;', true);
        if (!_this.config.isPool) _this.connection.end();
        reject(resuarr);
      }
    });
  }

}

const mysql = require('mysql2');

class Base {
  constructor(config) {
    this.sqlObj = {};
    this.pageNum = 1;
    this.pageSize = 50;
    this.config = config;
  }

  table(tableName) {
    if (!tableName) {
      throw new Error('无效的表名!');
    }

    if (this.config.defaultSqlPre) {
      tableName = this.config.defaultSqlPre + tableName;
    }

    if (tableName) this.sqlObj.table = tableName;
    return this;
  }

  alias(tableAlias) {
    if (tableAlias) {
      this.sqlObj.alias = tableAlias;
    } else {
      throw new Error('请输入有效的别名');
    }

    return this;
  }

  field(opt) {
    if (typeof opt === 'object') {
      opt = opt.join(',');
    }

    this.sqlObj.field = opt;
    return this;
  }

  where(opt) {
    let result = '';

    if (typeof opt === 'string') {
      result = mysql.escape(opt);
    } else {
      result = getWhereToString(opt);
    }

    if (result) this.sqlObj.where = result;
    return this;
  }

  data(data) {
    let newData;

    if (typeof data === 'string') {
      let arr = data.split('&');
      arr.forEach(item => {
        let itemArr = item.split('=');
        newData[itemArr[0]] = mysql.escape(itemArr[1]);
      });
    } else if (isType(data, 'object')) {
      newData = {};

      for (let i in data) {
        newData[i] = mysql.escape(data[i]);
      }
    } else if (isType(data, 'array')) {
      newData = [];

      for (let i = 0; i < data.length; i++) {
        for (let j in data[i]) {
          newData[i] = newData[i] ? newData[i] : {};
          newData[i][j] = mysql.escape(data[i][j]);
        }
      }
    }

    this.sqlObj.data = newData;
    return this;
  }

  order(opt) {
    let orderby = 'ORDER BY';

    if (typeof opt === 'object') {
      opt = opt.join(',');
    }

    if (opt === '' || opt.length === 0 || opt === undefined) {
      this.sqlObj.order = '';
    } else {
      this.sqlObj.order = `${orderby} ${opt}`;
    }

    return this;
  }

  limit(...args) {
    if (args.length > 2) {
      throw new Error('limit()的参数为不能大于两个!');
    } else {
      this.sqlObj.limit = `LIMIT ${args.join(',')}`;
    }

    return this;
  }

  page(...args) {
    if (args.length === 2) {
      let [begin, end] = args;
      begin = begin || this.pageNum;
      end = end || this.pageSize;
      begin = (begin - 1) * end;
      this.sqlObj.limit = `LIMIT ${begin}, ${end}`;
    } else {
      throw new Error('page()的参数为两个整型数字!');
    }

    return this;
  }

  join(obj) {
    this.sqlObj.join = formatJoin(obj, this.sqlObj.alias, this.sqlObj.table);
    return this;
  }

  union(str, type = false) {
    if (typeof str === 'string') {
      if (this.sqlObj.union) {
        this.sqlObj.union = `${this.sqlObj.union} (${str}) ${type ? 'UNION ALL' : 'UNION'}`;
      } else {
        this.sqlObj.union = `(${str}) ${type ? 'UNION ALL' : 'UNION'} `;
      }
    } else if (typeof str === 'object') {
      if (this.sqlObj.union) {
        this.sqlObj.union = `${this.sqlObj.union} (${str.join(type ? ') UNION ALL (' : ') UNION (')})  ${type ? 'UNION ALL' : 'UNION'} `;
      } else {
        this.sqlObj.union = `(${str.join(type ? ') UNION ALL (' : ') UNION (')}) ${type ? 'UNION ALL' : 'UNION'} `;
      }
    }

    return this;
  }

  distinct(field) {
    if (field) {
      this.sqlObj.distinct = `DISTINCT ${field}`;
    }

    return this;
  }

  lock(flag) {
    if (flag) {
      this.sqlObj.lock = 'FOR UPDATE';
    }

    return this;
  }

  comment(str) {
    if (str) {
      this.sqlObj.comment = `/* ${str} */`;
    }

    return this;
  }

  group(field) {
    this.sqlObj.group = `GROUP BY ${field}`;
    return this;
  }

  having(field) {
    this.sqlObj.having = `HAVING ${field}`;
    return this;
  }

  count(field = 1, alias = 'total') {
    this.sqlObj.count = `COUNT(${field}) AS ${alias}`;
    return this;
  }

  max(field, alias = 'max') {
    if (field) {
      this.sqlObj.max = `MAX(${field}) AS ${alias}`;
    }

    return this;
  }

  min(field, alias = 'min') {
    if (field) {
      this.sqlObj.min = `MIN(${field}) AS ${alias}`;
    }

    return this;
  }

  avg(field, alias = 'avg') {
    if (field) {
      this.sqlObj.avg = `AVG(${field}) AS ${alias}`;
    }

    return this;
  }

  sum(field, alias = 'sum') {
    if (field) {
      this.sqlObj.sum = `SUM(${field}) AS ${alias}`;
    }

    return this;
  }

}

class Curd {
  constructor(config) {
    this.sqlObj = {};
    this.config = config;
  }

  select() {
    let result = '';
    this.sqlObj.queryType = 'select';

    if (this.sqlObj.union) {
      result = this.sqlObj.union;

      if (result.substr(-10).indexOf('ALL') != -1) {
        result = result.replace(/\sUNION\sALL\s*$/, '');
      } else {
        result = result.replace(/\sUNION\s*$/, '');
      }

      this.sqlObj = {};
      return result;
    }

    let newSqlObj = sortSelectSql(this.sqlObj);
    newSqlObj.sortkeys.forEach(item => {
      if (newSqlObj.result[item]) {
        result = `${result} ${newSqlObj.result[item]}`;
      }
    });
    const sqlStr = `SELECT ${result.replace(/'/g, '\'')} `;
    this.sqlObj.sqlStr = sqlStr;
    return this;
  }

  find() {
    this.sqlObj.queryType = 'find';
    let result = '';

    if (this.sqlObj.union) {
      result = this.sqlObj.union;

      if (result.substr(-10).indexOf('ALL') != -1) {
        result = result.replace(/\sUNION\sALL\s*$/, '');
      } else {
        result = result.replace(/\sUNION\s*$/, '');
      }

      this.sqlObj = {};
      return result;
    }

    this.sqlObj.limit = `LIMIT 0, 1`;
    let newSqlObj = sortSelectSql(this.sqlObj);
    newSqlObj.sortkeys.forEach(item => {
      if (newSqlObj.result[item]) {
        result = `${result} ${newSqlObj.result[item]}`;
      }
    });
    const sqlStr = `SELECT ${result.replace(/'/g, '\'')} `;
    this.sqlObj.sqlStr = sqlStr;
    return this;
  }

  update() {
    let result = '';
    let datastr = '';
    let newData = this.sqlObj.data || {};
    this.sqlObj.queryType = 'update';

    if (isEmptyObj(this.sqlObj.where) || this.sqlObj.where === '') {
      return false;
    }

    let keys = Object.keys(newData);
    keys.forEach((item, index) => {
      let value = checkType(newData[item]);
      datastr += `${item}=${value}` + (index === keys.length - 1 ? ' ' : ',');
    });

    if (!datastr) {
      throw new Error('无更新的数据！');
    }

    result = `UPDATE ${this.sqlObj.table} SET ${datastr} WHERE ${this.sqlObj.where}`;
    this.sqlObj.sqlStr = result;
    return this;
  }

  insert() {
    this.sqlObj.queryType = 'insert';
    let newData = this.sqlObj.data || {};
    const datastr = insertData(newData);

    if (!datastr) {
      return this;
    }

    let result = `INSERT INTO ${this.sqlObj.table} ${datastr}`;
    this.sqlObj.sqlStr = result;
    return this;
  }

  delete() {
    if (isEmptyObj(this.sqlObj.where) || this.sqlObj.where === '') {
      return false;
    }

    this.sqlObj.queryType = 'delete';
    let order = this.sqlObj.order ? this.sqlObj.order : '';
    let limit = this.sqlObj.limit ? this.sqlObj.limit : '';
    let result = `DELETE FROM ${this.sqlObj.table} WHERE ${this.sqlObj.where} ${order} ${limit}`;
    const sqlStr = result.replace(/'/g, '\'');
    this.sqlObj.sqlStr = sqlStr;
    return this;
  }

  query(opt) {
    opt = opt ? opt : '';
    this.sqlObj.sqlStr = opt;
    return this;
  }

}

function getConfig(config) {
  return config = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'test',
    acquireTimeout: 10000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    isPool: true,
    defaultSqlPre: '',
    isDebug: true,
    ...config
  };
}

class hMysql extends mixin(Core, Base, Curd, Core) {
  constructor(config) {
    let conf = getConfig(config);
    super(conf);
    Base.new(conf);
    Curd.new(conf);
    Core.new(conf);
  }

}

module.exports = hMysql;
