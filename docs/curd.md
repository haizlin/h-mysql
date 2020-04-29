## CURD操作

#### 原生
```js
let sql = 'select id, age, name from demo where id=123'
hMsql.query(sql);

```
#### 插入
> 调用.insert()方法插入数据，由[.data()]()提供数据

```javascript 
// data为字符串，使用&相连
hMsql.table('demo')
    .data('age=18&name=wanglin')
    .insert()

=> INSERT INTO demo (age,name) VALUES (`18`,`wanglin`)

// data为对象
hMsql.table('demo')
    .data({
        age:18,
        name: 'wanglin'
    })
    .insert()
=> INSERT INTO demo (age,name) VALUES (`18`,`wanglin`)

// 批量插入 data为数组，提示：批量插入时会自动进行优化，当超过一定数量时，会对数组进行拆分和切换模式，具体可以查看.data()
hMsql.table('demo')
    .data([{
            age: 18,
            name: 'wanglin'
        },
        {
            age: 18,
            name: 'wanglin'
        }])
    .insert()
=> INSERT INTO demo (age,name) VALUES (`18`,`wanglin`), (`20`,`langzishenjian`)

```

#### 更新
> 调用 .delete() 方法，必填.where()

```javascript

// 单条更新
hMsql.table('demo')
    .data({
        age: 18,
        name: 'wanglin'
    })
    .where({id: 123})
    .update()
=> UPDATE demo SET age=18, name='wanglin' WHERE id=123

// 批量更新
hMsql.table('demo')
    .data([{
        age: 18,
        name: 'wanglin'
    },
    {
        age: 20,
        name: 'langzishenjian'
    }])
    .where({IN: [2,3]})
    .update()
=> 
UPDATE demo
  SET age = CASE id
    WHEN 2 THEN 18
    WHEN 3 THEN 20
  END,
  name = CASE id
    WHEN 2 THEN 'wanglin'
    WHEN 3 THEN 'langzishenjian'
  END
WHERE id IN (2,3)

```

#### 删除
> 调用 .delete() 方法，必填.where()

```javascript
// 单条删除
hMsql.table('demo')
    .where({id: 123})
    .delete()
=> DELETE FROM demo WHERE id='123'

// 批量删除
hMsql.table('demo')
    .where({IN: [123, 456, 789]})
    .delete()
=> DELETE FROM demo WHERE id IN (123,456, 789)

```

#### 查询
* 普通查询
```javascript
// 单条查询
hMsql.table('demo')
    .field('id, age, name')
    .where({id: 123})
    .find()

=> SELECT id, age, name FROM demo where id='123' limit 0, 1

// 多条查询
hMsql.table('demo')
    .field('id, age, name')
    .where({id: 123})
    .select()

=> SELECT id, age, name FROM demo where id='123'
```
* 表达式查询

|名称（不区分大小写）  | 描述        |
| ------------- |:------------- |
| EQ            | 等于（=）        |
| NEQ           | 不等于（<>）     |
| GT            | 大于（>）        |
| EGT           | 大于等于（>=）    |
| LT            | 小于（<）        |
| ELT           | 小于等于（<=）    |
| LIKE          | 模糊查询         |
| [NOT] BETWEEN | （不在）区间查询    |
| [NOT] IN      | （不在）IN 查询   |

```javascript
// 等于(EQ)
hMsql.table('demo')
    .field('id, age, name')
    .where({id: {EQ: 123}})
    .select()

=> SELECT id, age, name FROM demo where id=123

// 不等于(NEQ)
hMsql.table('demo')
    .field('id, age, name')
    .where({id: {NEQ: 123}})
    .select()

=> SELECT id, age, name FROM demo where id<>123
```
* 统计查询

|名称（不区分大小写）  | 描述        |
| ------------- |:------------- |
| count         | 统计数量，参数是要统计的字段名（可选）       |
| max           | 获取最大值，参数是要统计的字段名（必须）     |
| min           | 获取最小值，参数是要统计的字段名（必须）     |
| avg           | 获取平均值，参数是要统计的字段名（必须）     |
| sum           | 获取总分，参数是要统计的字段名（必须）       |

```javascript
// 统计数量(count)
hMsql.table('demo')
    .field('id, age, name')
    .where({id: 123})
    .count()

=> SELECT count(id) FROM demo where id=123

```
* 组合查询
* 复合查询
* 子查询
* 联合查询
* 区间查询
```javascript
hMsql.table('demo')
    .field('id, age, name')
    .where({IN: [1,2,3]})
    .select()

=> SELECT id, age, name FROM demo where id IN (1,2,3)
```

