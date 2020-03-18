const hMysql = require('h-mysql');

const {error, result} = await hMysql.table('user')
  .where({ id: 100 })
  .select()
  .execSql();

console.log(result);