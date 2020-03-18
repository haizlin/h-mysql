const Mysql = require('../dist/h-mysql.js');
const chai = require('chai');
const expect = chai.expect;

const config = {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'test-db',
  port: 3306,
};
const mysql = new Mysql(config);

describe('connection', function() {
  it ('connect test', function() {
    expect(mysql._getConnection.bind(mysql)).to.not.throw(Error);
  });
});