Welcome to nbatis!
===

![](https://github.com/vyspace/nbatis/blob/master/nbatis.jpg) 
<br/>
<br/>
![](https://img.shields.io/travis/rust-lang/rust.svg)  ![](https://img.shields.io/badge/tag-latest-blue.svg)

This a node plugin about data persistence, if you used mybatis before, you'll learn it soon..
The plugin is given priority to with node [mysql](https://www.npmjs.com/package/mysql) driver，at present.
Nbatis is mostly API compatible with [mysql](https://www.npmjs.com/package/mysql) and supports majority of features. It also offers these additional features.


----------


### Table of contents
- [Install](#install)
- [Configuration](#configuration)
- [Example](#example)
- [Dynamic SQL](#dynamic-sql)
- [Multiple table operation](#multiple-table-operation)
- [API](#api)

-------------
### Install

```javascript
npm install nbatis --save
```

### Configuration

 - You need to create a json file, its default name is   
   **nbatis_config.json**，of  course you can name it anyother name. The configuration is below:

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

 - Creating mapper file. This is a json file, its default name is
   **classname_config.json**. You can create mapper folder, and put all mapper files in this folder.
The configuration is below:

```javascript
{
  "add": {
    "parameterType": "object",
    "sql": "insert into user (username,password) values (#{username},#{password})"
  },
  "loadById": {
    "parameterType": "number",
    "sql": "select * from user where id=#{id}"
  }
}
```

|  ps       | mapper explanation  |
| ------------- |:-------------|
| parameterType| javascript basic data type: number, string, boolean, object|
| #| The program will put #{} replaced with ?, [escaping-query-values](https://www.npmjs.com/package/mysql#escaping-query-values)|
| $| The program will put \${} replaced with parameter values|



### Example

##### The following code uses the ES6 syntax

- First of all, you'd better create a class file **User.js** 
```javascript
'user strict';

const _id = Symbol('id'),
    _username = Symbol('username'),
    _password = Symbol('password');
class User {
    constructor(id = 0, username = '', password = '') {
        this[_id] = id;
        this[_username] = username;
        this[_password] = password;
    }
    set id(value) {
        this[_id] = value;
    }
    get id() {
        return this[_id];
    }
    set username(value) {
        this[_username] = value;
    }
    get username() {
        return this[_username];
    }
    set password(value) {
        this[_password] = value;
    }
    get password() {
        return this[_password];
    }
    static getDirName() {
        return __dirname;
    }
}

module.exports = User;
```

 - Second, you need to create global session factory. Now we create a util file **SNBatisUtil.js**;  It is a static class and introduce nbatis module and the factory is singleton.

```javascript
'user strict';

const path = require('path'),
    SqlSessionFactory = require('nbatis'),
    _static = Symbol('static');
let factory = null;
class SNBatisUtil {
    constructor() {
        throw new Error('SNBatisUtil is a static class.');
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

 - Third, creating a js dao file **BaseDao.js**; Including basis of  database operations in here.
 

```javascript
'use strict';

const SNBatisUtil = require('./SNBatisUtil');

class BaseDao {
    async add(tag, obj) {
        let session = null;
        try {
            session = await SNBatisUtil.createSession();
            await session.insert(tag, obj);
        }
        catch (err) {
            throw err;
        }
        finally {
            await SNBatisUtil.closeSession(session);
        }
    }
    async load(tag, obj) {
        let session = null,
            data = null;
        try {
            session = await SNBatisUtil.createSession();
            data = await session.selectOne(tag, obj);
        }
        catch (err) {
            throw err;
        }
        finally {
            await SNBatisUtil.closeSession(session);
        }
        return data;
    }
}

module.exports = BaseDao;
```

- For now,  we can create a user dao test file **userDao.js** to test functions:

```javascript
'use strict';
const BaseDao = require('./BaseDao');
    User = require('./User');
class UserDao extends BaseDao {
    async add(user) {
        try {
            const loadUser = await super.load('User.loadByName', user.username);
            if(loadUser !== null) {
                throw new Error(`${user.username} already exists`);
            }
            await super.add('User.add', user);
        }
        catch (err) {
            throw err;
        }
    }
}

const user = User('test', '123');
    userDao = UserDao();
user.add(user);

```

### Dynamic SQL

You can put javascript commands into sql, we still modify mapper file **classname.json**

```javascript
"pager": {
    "parameterType": "object",
    "dynamic": true,
    "sql": "select * from user <%if({{username}}) return 'where username like #{username}'%> <%if({{sort}}) return 'order by ${sort} ${order}'%> <%if({{pageSize}}) return 'limit #{pageOffset}, #{pageSize}'%>"
},
```
|  ps       | mapper explanation  |
| ------------- |:-------------|
| dynamic| true or false, default value is false. if true, the program will explain this code|
|<%%>|javascript code is included between symbols|
|{{param}}|The variable param replace ${param｝|

### Multiple table operation

- If you want to operate multiple tables in one transaction, you can join multiple  sql commands with semi-colon. An example is shown below:


```javascript
{
    "add": {
        "parameterType": "object",
        "sql": "insert into user (username, password) values (#{Username}, {#Password});insert into user_info (gender) values (#{gender})"
    }
}
```

### API

Class|Object |Name   |Parameter| Static |   Description
-----------| ------ |--------|----|------|---------
SqlSessionFactory|factory|createPool || no     | create a database connection pool
SqlSessionFactory|factory|openSession|| no     | to get a connection from connection pool
SqlSessionFactory|factory|closeSession|session| no     | to release a connection to connection pool
Session|session|selectOne |tag, param| no     | return a record
Session|session|selectList | tag, param|no     | return a record list
Session|session|insert | tag, param|no     | insert a object into table
Session|session|update | tag, param|no     | update a record in the table
Session|session|delete | tag, param|no     | delete a record from the table


#### More specifications,  in the building...

<br/>
<br/>


[![NPM](https://nodei.co/npm/nbatis.png)](https://nodei.co/npm/nbatis/)
