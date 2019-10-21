import SqlSessionFactory from './SqlSessionFactory';

export default class SqlSessionTemplate {
	factory:any
	constructor(path:string) {
		this.factory = new SqlSessionFactory().createPool(path);
	}
	selectList(tag:string, params:any):Promise<any> {
		return this.pormiseFactory('selectList', tag, params, '', false);
	}
	selectOne(tag:string, params:any):Promise<any> {
		return this.pormiseFactory('selectOne', tag, params, '', false);
	}
	insert(tag:string, params:any):Promise<any> {
		return this.pormiseFactory('insert', tag, params, '', true);
	}
	update(tag:string, params:any):Promise<any> {
		return this.pormiseFactory('update', tag, params, '', true);
	}
	delete(tag:string, params:any):Promise<any> {
		return this.pormiseFactory('delete', tag, params, '', true);
	}
	queryGet(sql:string):Promise<any> {
		return this.pormiseFactory('queryGet', '', null, sql, true);
	}
	querySet(sql:string):Promise<any> {
		return this.pormiseFactory('querySet', '', null, sql, true);
	}
	private pormiseFactory(methodName:string, tag:string, params:any, sql:string, isSet:boolean):Promise<any> {
		return new Promise(async (resolve:Function, reject:Function)=>{
			let session:any,
				res:any = null;
			try{
				session = await this.factory.openSession();
				if(sql) {
					res = await session[methodName](sql);
				}
				else {
					res = await session[methodName](tag, params);
				}
		    }
		    catch(err) {
		    	if(isSet && session) {
		    		session.rollback();
		    	}
		        reject(err);
		    }
		    finally {
		    	if(session) {
		    		session.release();
		    	}
		    	resolve(res);
		    }
		});
	}
	end():Promise<any> {
		return new Promise((resolve:Function, reject:Function)=>{
			this.factory.getPool().end((err:any)=>{
				if(err) {
					reject(err);
				}
				else {
					resolve(true);
				}
			});
		})
	}
}