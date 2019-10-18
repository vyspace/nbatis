Welcome to NBatis2.0 !
===

![](https://github.com/vyspace/nbatis/blob/master/nbatis.jpg) 
<br/>
<br/>
![](https://img.shields.io/travis/rust-lang/rust.svg)  ![](https://img.shields.io/badge/tag-latest-blue.svg)

This a node.js plugin about data persistence, if you used mybatis before, you'll learn it soon..
The plugin is given priority to with node [mysql](https://www.npmjs.com/package/mysql) driver，at present.
NBatis is mostly API compatible with [mysql](https://www.npmjs.com/package/mysql) and supports majority of features. It also offers these additional features.

----------


### Table of contents
- [Install](#install)
- [Example](#example)
- [Common SQL](#common-sql)
- [Dynamic SQL](#dynamic-sql)
- [Multiple SQL](#multiple-sql)
- [API](#api)

-------------
### Install

```javascript
npm install nbatis --save
```

### Example

> PS: It is recommended to use typescript to code your project. Make sure typescript is installed before this example. Please install the ts plug-in globally.

##### Create POJO

 - We can create a pojo class named **UserSQL.ts**. This class can help us to create test table in the database.


```javascript
import { DBUtil } from 'nbatis';

export default class UserSQL {
    id:any;
    username:any;
    password:any;
    gender:any;
    birthday:any;
    email:any;
    url:any;
    createTime:any;
    constructor() {
        this.id = {
            type: 'int(11)',
            primary: true
        };
        this.username = {
            type: 'varchar(255)',
            notNull: true,
            default: '',
            value: ()=>DBUtil.randomString('w', 'm')
        };
        this.password = {
            type: 'varchar(255)',
            default: '',
            value: ()=>DBUtil.randomString('d', '', 6)
        };
        this.gender = {
            type: 'char(1)',
            notNull: true,
            default: '',
            value: ()=>DBUtil.randomValueFromList(['M','F'])
        }
        this.birthday = {
            type: 'Date',
            value: ()=>DBUtil.randomDateTimeString('1980-01-01', '2010-12-12', 'yyyy-MM-dd')
        };
        this.email = {
            type: 'varchar(255)',
            value: ()=>DBUtil.randomEmail()
        }
        this.url = {
            type: 'varchar(255)',
            value: ()=>DBUtil.randomDomain()
        }
        this.createTime = {
            type: 'DateTime',
            notNull: true,
            default: '#{NOW()}'
        };
    }
}
```


 - Each item in the table corresponds to each property of the pojo class, all of which are public and default value is a object. The object have several properties. These properties help us complete the SQL statement.


```javascript
{
    type: '', //SQL data type, the type is string.
    primary: false, //To determine whether the property is a primary key, the type is boolean.
    notNull: false, //To determine whether the property is NOT NULL, the type is boolean.
    default: '', //SQL default value, the type is any.
    value: 0 //This property is used when bulk data is inserted. It can be of any type, most of the time it's a random function.
}
```

##### Create Unit Test Case


 - We use tunit which is a typescript unit test plugin here. First of all, to install tunit.

```javascript
npm install tunit --save-dev
```

 - Second, create a entity class named **TheTest.ts**. Because a decorator in tunit is named Test so the name of the test class cannot be called "Test".

 ```javascript
import path from 'path';
import { BeforeClass,Test,AfterClass,TUnit,Assert } from 'tunit';
import { SqlSessionFactory, DBUtil } from 'nbatis';
import UserSQL from './UserSQL';

@TUnit('./') //If you want to get the test log, you need to fill in the path to the log file
export default class TheTest {
    session:any;
    constructor() {
        this.session = null;
    }

    @BeforeClass
    async init(next:Function) {
        try {
            const configrationFilePath = path.join(__dirname, './nbatis_config.json'),
            factory = new SqlSessionFactory().createPool(configrationFilePath);
            this.session = await factory.openSession();
            next();
        }
        catch(err) {
            next(err);
        }
    }
    /**
     * To test creating a table with the class.
     */
    @Test
    async createTable(next:Function) {
        const sql = DBUtil.createTableSQL(UserSQL);
        try {
            const res = await this.session.querySet(sql);
            next(res);
        }
        catch(err) {
            await this.session.rollback();
            next(err);
        }
    }
    /**
     * To test the method queryGet.
     */
    @Test
    async getTableDesc(next:Function) {
        const sql = 'desc user_sql';
        try {
            const res = await this.session.queryGet(sql);
            next(res);
        }
        catch(err) {
            next(err);
        }
    }
    /**
     * To test inserting random data in quantity.
     */
    @Test
    async batchInsert(next:Function) {
        const sql = DBUtil.batchInsertSQL(UserSQL, '', 10);
        try {
            const res = await this.session.querySet(sql);
            const assert = Assert.assertNotNull(res);
            next(res, assert);
        }
        catch(err) {
            this.session.rollback();
            next(err);
        }
    }
    /**
     * To test getting a list of data
     */
    @Test
    async selectList(next:Function) {
        try{
            const params = {
                start:0,
                length:5
            },
            res = await this.session.selectList('UserSQL.list', params),
            assert = Assert.assertNotNull(res);
            next(res, assert);
            
        }
        catch(err) {
            next(err);
        }
    }
    /**
     * To test getting a piece of data by id.
     */
    @Test
    async testSelectOne(next:Function){
        try{
            const params = {
                tableName: 'user_sql',
                id:1
            }
            const res = await this.session.selectOne('UserSQL.loadById', params);
            next(res);
        }
        catch(err) {
            next(err);
        }
    }
    /**
     * To test updating a piece of data
     */
    @Test
    async update(next:Function){
        try{
            const params = {
                id: 1,
                url:'www.test001.com'
            },
            res = await this.session.insert('UserSQL.updateById', params);
            next(res);
        }
        catch(err) {
            this.session.rollback();
            next(err);
        }
    }
    /**
     * To test dynamic sql commands
     */
    @Test
    async pager(next:Function) {
        try{
            const params = {
                tableName: 'user_sql',
                where: '"%com"',
                start:0,
                pageSize:5,
                order: 'desc'
            },
            res = await this.session.selectList('UserSQL.pager', params);
            next(res);
        }
        catch(err) {
            next(err);
        }
    }
    /**
     * To test deleting a piece of data
     */
    @Test
    async delete(next:Function){
        try{
            const res = await this.session.insert('UserSQL.deleteById', 10);
            next(res);
        }
        catch(err) {
            this.session.rollback();
            next(err);
        }
    }
    /**
     * To test multiple sql commands in one transaction, the sql commands must be modify instructions of table.
     */
    @Test
    async insertAndUpdate(next:Function){
        try{
            const params = {
                tableName:'user_sql',
                username:'test002',
                password:'123456',
                gender:'M',
                birthday:'1996-01-01',
                email:'test002@vys.cc',
                url:'test.vys.cc',
                updatePassword:'654321'
            },
            res = await this.session.insert('UserSQL.insertAndUpdate', params);
            next(res);
        }
        catch(err) {
            this.session.rollback();
            next(err);
        }
    }
    /**
     * To test deleting a table with the class
     */
    @AfterClass
    async dropTabel(next:Function) {
        const sql = DBUtil.dropTableSQL(UserSQL);
        let res:any;
        try {
            res = await this.session.querySet(sql);
        }
        catch(err) {
            this.session.rollback();
            next(err);
        }
        finally {
            if(this.session) {
                await this.session.release();
                await this.session.destroy();
            }
            next(res);
        }
    }
}
 ```

Next we start configuring nbatis.



##### Configuration



 - Fist, to create a configuration file  named **nbatis_config.json**，of course you can name it anyother name.

  The configuration items are here:

```javascript
{
    "dataSource": {
        "host": "your database address",
        "user": "your username",
        "password": "your password",
        "database": "your database name",
        "connectionLimit": 5
    },
    "mappers": {
        "UserSQL": "./user_mapper.json"
    }
}
```

 - Second, creating mapper file called **user_mapper.json**. If you have multiple mapper files, you can put them in one folder.


```javascript
{
  "list": {
    "parameterType": "object",
    "sql": "select * from user_sql limit ${start},${length}"
  },
  "loadById": {
    "parameterType": "object",
    "sql": "select * from user_sql where id=${id}"
  },
  "pager": {
    "parameterType": "object",
    "dynamic": true,
    "sql": "select * from user_sql <%if({{where}}){return 'where url like ${where}'}%> <%if({{orderKey}}&&{{order}}){return 'order by ${orderKey} ${order}';}%> <%if({{start}}&&{{pageSize}}){return 'limit ${start},${pageSize}';}%>"
  },
  "updateById": {
    "parameterType": "object",
    "sql": "update user_sql set url=#{url} where id=#{id}"
  },
  "deleteById": {
    "parameterType": "number",
    "sql": "delete from user_sql where id=#{id};"
  },
  "insertAndUpdate": {
    "parameterType": "object",
    "sql": "insert into ${tableName} (username,password,gender,birthday,email,url) values (#{username},#{password},#{gender},#{birthday},#{email},#{url});update ${tableName} set password=#{updatePassword} where username=#{username}"
  }
}
```

 - Attribute Description:

|  Property      | Description  |
| ------------- |:-------------|
| parameterType| Javascript basic data type: number, string, boolean, object; the type is string|
| dynamic|Whether the SQL statement is dynamic, the type is boolean or undefined|
| sql|SQL statements with variables, the type is string|


##### Run


 - Make sure the typescript configuration file **tsconfig.json** is generated before running.


```javascript
tsc --init 
```

- For now, you can run the unit test case.


```javascript
ts-node ./TheTest.ts
```

 > If you set a path in the decorator TUnit, the **tunit.log** file will be generated at the end of the test under that path. The resulting log is written to the file as an addendum.



### Common SQL

Description of non-dynamic SQL statements in mapper files

|  Symbol      | Description  |
| ------------- |:-------------|
| ${} |The program will put \${} replaced with parameter values|
| #{} |The program will put #{} replaced with ?, [escaping-query-values](https://www.npmjs.com/package/mysql#escaping-query-values)|


### Dynamic SQL

You can write SQL statements as normal js syntax, allowing the SQL statements to produce different results as parameters.

|   Symbol       | Description  |
| ------------- |:-------------|
|<%%>|javascript code is included between symbols|
|{{params}}|The SQL parameters that appear in the javascript statement are wrapped in {{}}|


### Multiple SQL

- If you want to multiple operations in one transaction, you can join multiple sql commands with semi-colon.

 > All statements must be modify the statement for the table.

Here is a example:

```javascript
"insert into ${tableName} (username,password,gender,birthday,email,url) values (#{username},#{password},#{gender},#{birthday},#{email},#{url});update ${tableName} set password=#{updatePassword} where username=#{username}"

```

 > Multiple SQL runs can also manipulate multiple tables.


### API

**[SqlSessionFactory]**
```javascript
createPool(configFilePath:string):any
```
 - Parameters
 configFilePath: The path to the configuration file.

 - Return factory object.

```javascript
 openSession():Promise<any>
```
 - Return session.

**[Session]**
```javascript
async selectList(tag:string, params:any):Promise<any>
```
 - Parameters
 tag: The key of item in mapper file.
 params: Parameters to pass.

 - Return a list of data.

```javascript
 async selectOne(tag:string, params:any):Promise<any>
```
 - Parameters
 tag: The key of item in mapper file.
 params: Parameters to pass.

 - Return a piece of data.

```javascript
 async insert(tag:string, params:any):Promise<any>
 async update(tag:string, params:any):Promise<any>
 async delete(tag:string, params:any):Promise<any>
```
 - Parameters
 tag: The key of item in mapper file.
 params: Parameters to pass.

 - Return a list of state object.

```javascript
 async queryGet(sql:string):Promise<any>
```
 - Parameters
 sql: SQL statement

 - Return the query results.

 ```javascript
 async querySet(sql:string):Promise<any>
 ```
 - Parameters
 sql: SQL statement

 - Return a list of state object.

**[DBUtil]**
```javascript
static createTableSQL(typeReference:any, tableName?:string):string
```
 - Parameters
 typeReference: Class.
 tableName: Table name.

 - Return sql statement.

```javascript
static batchInsertSQL(typeReference:any, tableName?:string, dataNumber?:number):string
```
 - Parameters
 typeReference: Class.
 tableName: Table name.
 dataNumber: The amount of data inserted.

 - Return sql statement.


```javascript
static dropTableSQL(params:any):string
```
 - Parameters
 params: Class or table name.

 - Return sql statement.

```javascript
static randomString(tag:string, letterCase?:string, len?:number):string
```
 - Parameters
 tag: String content, 'w':alphanumeric; 'c':pure letters; 'd': pure numbers.
 letterCase: Case mark, 'l':lowercase; 'b':uppercase; 'm':case mixing.
 len: The length of string.

 - Return a random string.

```javascript
static randomDateTimeString(startDate?:string, endDate?:string, returnFormat?:string):string
```
 - Parameters
 startDate: Start date, the default value is '1970-01-01'.
 endDate: End date, the default value is now.
 returnFormat: The length of string.

 - Returns the format of the datetime string, the format is 'yyyy-MM-dd' or 'hh:mm:ss' or 'yyyy-MM-dd hh:mm:ss'.

```javascript
static randomValueFromList(dataList:Array<any>):string
```
 - Parameters
 dataList: A list.

 - Returns a random value in the array.

```javascript
static randomEmail():string
```

 - Returns a random email.

```javascript
static randomDomain(isSubDomain?:boolean):string
```
 - Parameters
 isSubDomain: Determines whether the sub-domain name is generated. if true return 'xxx.domain.com' else 'www.domain.com'

 - Returns a random domain name.

```javascript
static birthdayToAge(birthday:string):number
```
 - Parameters
 birthday: Datetime string, the format is '1970-01-01'

 - Return age.


#### More specifications,  in the building...

<br/>
<br/>


[![NPM](https://nodei.co/npm/nbatis.png)](https://nodei.co/npm/nbatis/)
