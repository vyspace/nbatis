import BaseConnection from './BaseConnection';

export default class IndirectConnection extends BaseConnection {
    async selectList(tag:string, params:any):Promise<any> {
        let result:any=null;
            try {
                const rows = await super.doGet(tag, params, this);
                if(rows && rows.length > 0) {
                    result = rows;
                }
            }
            catch(err) {
                throw err;
            }
            finally {
                return result
            }
    }
    async selectOne(tag:string, params:any):Promise<any> {
        let result:any=null;
        result = await this.selectList(tag, params);
        if(result && result.length>0) {
        	return result[0];
        }
        else {
        	return result;
        }
    }
    async insert(tag:string, params:any):Promise<any> {
        try {
            return await super.doSet(tag, params, this);
        }
        catch(err) {
            throw err;
        }
    }
    async update(tag:string, params:any):Promise<any> {
        try {
             return await super.doSet(tag, params, this);
        }
        catch(err) {
            throw err;
        }
    }
    async delete(tag:string, params:any):Promise<any> {
        try {
            return await super.doSet(tag, params, this);
        }
        catch(err) {
            throw err;
        }
    }
    async queryGet(sql:string):Promise<any> {
        try {
             return await super.sqlGet(sql, this);
        }
        catch(err) {
            throw err;
        }
    }
    async querySet(sql:string):Promise<any> {
        try {
             return await super.sqlSet(sql, this);
        }
        catch(err) {
            throw err;
        }
    }
}