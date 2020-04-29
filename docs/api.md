## API列表
* CURD操作 [查看更多](./curd.md)
  * [.select()]() ⇒ Promise
    * 查询多条数据，结合.where, .limit避免数据量过大
  * [.find()]() ⇒ Promise
    * 查询单条数据，是.select()的语法糖
  * [.update()]() ⇒ Promise
    * 更新操作
  * [.insert()]() ⇒ Promise
  * [.delete()]() ⇒ Promise
  * [.query(sql: string)]() ⇒ Promise

* 链式方法
  * [.table(tableName: string)]() ⇒ Mysql
    * 设置要查找的表名
  * [.alias(tableAlias: string)]()⇒ Mysql
    * 给table添加别名
    ```javascript
        sql.table('demo').alias('d').field('id', 'age')
        => SELECT id, age FROM demo as d
    ```
  * [.field(opt: string | any[])]() ⇒ Mysql
    * 要查询的字段
    ```javascript
        sql.table('demo').field(['id', 'age'])
        => SELECT id, age FROM demo
    ```
  * [.where(opt: string | any[])]() ⇒ Mysql
    * 条件
  * [.limit(limit)]() ⇒ Mysql
     * 返回的数量
  * [.page(pageSize, pageNum)]() ⇒ Mysql
     * 条件
  * [.data(data:object | any[])]() ⇒ Mysql
    * 用作单条（批量）插入或更新的数据
     ```javascript
        // 单条插入
        sql.table('demo').data({age: 18, name: 'wanglin'}).insert()
        => INSERT INTO (age,name) VALUES (18, 'wanglin')

        // 批量插入
        sql.table('demo').data([{age: 18, name: 'wanglin'}, {age: 20, name: 'langzishenjian'}]).insert()
        => INSERT INTO (age,name) VALUES (18, 'wanglin'), (20, 'langzishenjian')

        // 单条更新
        sql.table('demo').data({age: 18, name: 'wanglin'}).upate()
        => UPDATE demo SET age=18, name='wanglin'

        // 批量更新
        sql.table('demo').data([{age: 18, name: 'wanglin'}, {age: 20, name: 'langzishenjian'}]).upate()
        => UPDATE demo SET age=18, name='wanglin'
    ```  
  * [.order(order)]() ⇒ Mysql
     * 条件
  * [.join()]() ⇒ Mysql
     * 联合查询
  * [.union()]() ⇒ Mysql
     * 条件
 
     * 条件
  * [.group(field)]() ⇒ Mysql
     * 条件
  * [.having(field)]() ⇒ Mysql
     * 聚合条件

  * [.count()]() ⇒ Promise
    * 统计数量
  * [.max(field)]() ⇒ Mysql
     * 获取最大值
  * [.min(field)]() ⇒ Mysql
     * 获取最小值
  * [.avg(field)]() ⇒ Mysql
     * 获取平均值
  * [.sum(field)]() ⇒ Mysql
     * 获取总数

  * [.lock(field, step)]() ⇒ Promise
     * 锁
  * [.distinct(field, step)]() ⇒ Promise
     * 去除查询结果中重复的数据
  * [.comment(str:string)]() ⇒ Promise
     * 注释
  * [.query()]() ⇒ string
     * 执行原生语句