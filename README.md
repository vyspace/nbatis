Welcome to nbatis!
===================
![](https://github.com/vyspace/nbatis/blob/master/nbatis.jpg) 
<br/>
![](https://img.shields.io/travis/rust-lang/rust.svg)  ![](https://img.shields.io/badge/tag-1.0.0-blue.svg)

This a node plugin about data persistence, if you used mybatis before, you'll learn it soon..

----------


# Quick start
-------------
#### Install
>  npm install nbatis --save

#### Configuration

 - You need to create a json file, its default name is   
   **nbatis_config.json**，of  course you can name it other name. The configuration is below:

```javascript
{
	"dataSource": {
	    "host": "database ip",
	    "user": "your username",
	    "password": "your password",
	    "database": "database name",
	    "connectionLimit": 5
	},
	"mappers": {
	    "class name": "./classname_mapper.json"
	}
}
```

 - Create a json file, its default name is
   **classname_config.json**，of  course you can name it other name. The configuration is below:

```javascript
{
  "add": {
    "parameterType": "object",
    "sql": "insert into user (username, password) values ({Username}, {Password})"
  },
  "loadById": {
    "parameterType": "number",
    "resultType": "cobject",
    "sql": "select * from user where id={id}"
  }
}
```

- To create sql mapper files, you need to create a folder and creating a json file to save sql command line， for example, a User.json
```javascript
{
  "add": {
    "parameterType": "object",
    "sql": "insert into user (username, password) values (#{username}, #{password})"
  },
  "loadById": {
    "parameterType": "number",
    "sql": "select * from user where id=#{id}"
  }
}
```

#### Example

 - Creating a js file name it SNBatisUtil,  it is a static class

```javascript
const path = require('path'),
    SqlSessionFactory = require('m_nbatis'),
    _static = Symbol('static');
let factory = null;
class SNBatisUtil {
    constructor() {
        throw new Error('SDaoUtil is a static class.');
    }
    static [_static]() {
        if(!factory) {
            try {
                const configPath = path.join(__dirname, './nbatis_config.json');
                factory = new SqlSessionFactory().createPool(configPath);
            }
            catch(err) {
                throw err;
            }
        }
    }
    static async createSession() {
        let session = null;
        try {
            session = await factory.openSession();
        }
        catch(err) {
            throw err;
        }
        return session;
    }
    static async rollback(session) {
        if(session) {
            await session.rollbacks();
        }
    }
    static async closeSession(session) {
        if(session) {
            await session.release();
        }
    }
}

SNBatisUtil[_static]();
module.exports = SNBatisUtil;
```

 - Creating a js class file name it BaseDao
 

```javascript
class BaseDao {
	static async test() {
        let session = null,
            flag = false;
        try {
            session = await SNBatisUtil.createSession();
            if(session) {
                flag = true;
            }
        }
        catch(err) {
            console.log('数据库链接失败！');
            throw err;
        }
        finally {
            await SNBatisUtil.closeSession(session);
        }
        return flag;
    }
    async add(tag, obj) {
        let session = null;
        try {
            session = await SNBatisUtil.createSession();
            await session.insert(tag, obj);
            await session.commits();
        }
        catch (err) {
            await SNBatisUtil.rollback(session);
            throw err;
        }
        finally {
            await SNBatisUtil.closeSession(session);
        }
    }
}

module.exports = BaseDao;
```
- You can create a test.js file,  at the end


```javascript
const BaseDao = require('./BaseDao');
BaseDao.test()
```

#### Dynamic SQL

You can use javascript command in the sql, we still use mapper file User.json

```javascript
"pager": {
    "parameterType": "object",
    "dynamic": true,
    "sql": "select * from user <%if({{username}}) return 'where username like #{username}'%> <%if({{sort}}) return 'order by ${sort} ${order}'%> <%if({{pageSize}}) return 'limit #{pageOffset}, #{pageSize}'%>"
},
```

#### API

Class       |Name   | Static |   Description
-----------| ------ |--------|---------------
SqlSessionFactory|createPool | no     | create a database connection pool
SqlSessionFactory|openSession| no     | to get a connection from connection pool
Factory|selectOne | no     | return a record
Factory|selectList | no     | return a record list
Factory|insert | no     | insert a object into table
Factory|update | no     | update a record in the table
Factory|commits | no     | to finish modifying operation of data table
Factory|rollbacks | no     | When you meet the error back


#### More specifications,  in the building...
