import path from 'path';
import { BeforeClass,Test,AfterClass,TUnit,Assert } from 'tunit';
import { SqlSessionTemplate, DBUtil } from '../index';
import UserSQL from './UserSQL';

@TUnit('./')
export default class TemplateTest {
	template:any
	constructor() {
		this.template = null;
	}
	@BeforeClass
	async init(next:Function) {
		try {
			const configrationFilePath = path.join(__dirname, './nbatis_config.json');
			this.template = new SqlSessionTemplate(configrationFilePath);
			next();
		}
		catch(err) {
			next(err);
		}
	}
	@Test
	async createTable(next:Function) {
		const sql = DBUtil.createTableSQL(UserSQL);
		try {
			const res = await this.template.querySet(sql);
			next(res);
		}
		catch(err) {
			next(err);
		}
	}
	@Test
	async batchInsert(next:Function) {
		const sql = DBUtil.batchInsertSQL(UserSQL, '', 10);
		try {
			const res = await this.template.querySet(sql);
			const assert = Assert.assertNotNull(res);
			next(res, assert);
		}
		catch(err) {
			next(err);
		}
	}
	@Test
	async selectList(next:Function) {
	    try{
	        const params = {
	        	start:0,
	        	length:5
	        },
	        res = await this.template.selectList('UserSQL.list', params),
	        assert = Assert.assertNotNull(res);
	        next(res, assert);
	    }
	    catch(err) {
	        next(err);
	    }
	}
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
	        res = await this.template.insert('UserSQL.insertAndUpdate', params);
	        next(res);
	    }
	    catch(err) {
	        next(err);
	    }
	}
	@Test
	async dropTabel(next:Function) {
		const sql = DBUtil.dropTableSQL(UserSQL);
		let res:any;
		try {
			res = await this.template.querySet(sql);
			next(res);
		}
		catch(err) {
			next(err);
		}
	}
	@AfterClass
	async endPool(next:Function) {
		try {
			const res = await this.template.getFactory().endPool();
			next(res);
		}
		catch(err) {
			next(err);
		}
	}
}