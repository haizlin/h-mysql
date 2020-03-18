# h-mysql

* **作者**：浪子神剑
* **邮箱**：<80285586@qq.com> 
* **网站**：[http://www.haizlin.com](http://www.haizlin.com)
* **介绍**：一直以来很喜欢Thinkphp的数据操作风格，所以在nodejs上也封装了一个MYSQL数据库的常用操作，支持链式调用，实现语义化的数据库操作。

## 安装及引用

```javascript

// npm安装
npm i h-mysql --save

// yarn安装
yarn add h-mysql

const hMysql = require('h-mysql');
```

## 初始化配置
```javascriipt
const hMysql = new mysql({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'test-db',
  port: 3306,

  acquireTimeout: 1000,
  waitForConnections: true,    //是否等待链接  
  connectionLimit: 10,  // 连接池数
  queueLimit: 0, // 排队限制 

  defaultSqlPre: '',
  isPool: true,
  isDebug: true
});

const {error, result} = await hMysql.table('user')
  .where({ id: 100 })
  .select()
  .execSql();

console.log(result);
```

## 调用方式
> 规则：调用方法跟顺序无关
```javascript
let hMysql = new hMysql(config)

hMysql.table()
      .where()
      .limit()
      .select()
      .execSql()
```

## [CURD操作](./docs/api.md)
* 添加：[insert] [table] [data]
* 查询：[select] [field] from [table] [alias] [where] [join]
* 更新：[update] [table] set [data] [where]
* 删除：[delete] from [table] [where]

## [API 文档](./docs/api.md)
* CURD操作
  * [.select()]() ⇒ Promise
  * [.find()]() ⇒ Promise
  * [.update()]() ⇒ Promise
  * [.updateMany()]() ⇒ Promise
  * [.insert()]() ⇒ Promise
  * [.delete()]() ⇒ Promise
  * [.query(sql: string)]() ⇒ Promise

* 链式方法
  * [.table(tableName: string)]() ⇒ Mysql
  * [.alias(tableAlias: string)]()⇒ Mysql
  * [.field(opt: string | any[])]() ⇒ Mysql
  * [.where(opt: string | any[])]() ⇒ Mysql
  * [.limit(limit)]() ⇒ Mysql
  * [.page(pageSize, pageNum)]() ⇒ Mysql
  * [.data(data:object)]() ⇒ Mysql
  * [.order(order)]() ⇒ Mysql
  * [.join()]() ⇒ Mysql
  * [.union()]() ⇒ Mysql
  * [.count()]() ⇒ Promise
  * [.group(field)]() ⇒ Mysql
  * [.having(field)]() ⇒ Mysql
  * [.count(field)]() ⇒ Mysql
  * [.max(field)]() ⇒ Mysql
  * [.min(field)]() ⇒ Mysql
  * [.avg(field)]() ⇒ Mysql
  * [.sum(field)]() ⇒ Mysql
  * [.lock(field, step)]() ⇒ Promise
  * [.distinct(field, step)]() ⇒ Promise
  * [.comment(str:string)]() ⇒ Promise
  * [.execSql()]() ⇒ string

## 迭代计划
- [ ] 完善API文档、架构文档
- [ ] 完善案例
- [ ] 批量插入、批量更新、批量删除
- [ ] 支持更复杂的链式操作
- [ ] 添加测试用例
- [ ] 重写异常处理方式
- [ ] 添加性能测试并添加每条语句执行的时间
- [ ] 添加安全测试，防注入
- [ ] 增加对数据库的操作（现在的功能都是针对表）
- [ ] 考虑是不是要支持ORM


## 版本更新
* v0.0.1
  * 实现常用方法的链式调用，未经过测试，慎用到生产环境，待更新到1.0版本吧

## 贡献

## License
[![MIT](http://api.haizlin.cn/api?mod=interview&ctr=issues&act=generateSVG&type=h-mysql)](https://github.com/haizlin/h-mysql/LICENSE)
