import path from 'path';
import { BeforeClass,Test,AfterClass,TUnit,Assert } from 'tunit';
import { SqlSessionFactory, DBUtil } from '../index';
import UserSQL from './UserSQL';

@TUnit('./')
export default class FactoryTest {
	factory:any
	session:any;
	constructor() {
		this.session = null;
		this.factory = null;
	}

	@BeforeClass
	async init(next:Function) {
		try {
			const configrationFilePath = path.join(__dirname, './nbatis_config.json');
			this.factory = new SqlSessionFactory().createPool(configrationFilePath);
			this.session = await this.factory.openSession();
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
	 * To test delete a table with the class
	 */
	@Test
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
	        }
	        next(res);
	    }
	}
	/**
	 * Test to close connection pool
	 */
	@AfterClass
	endPool(next:Function) {
		this.factory.getPool().end((err:any)=>{
			if(err) {
				next(err);
			}
			else {
				next(true);
			}
		});
	}
}
