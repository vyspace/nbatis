import mysql from 'mysql';
import path from 'path';
import fs from 'fs';
import IndirectConnection from './IndirectConnection';
import Util from './Util';

export default class SqlSessionFactory {
	private pool:any;
	constructor() {
		this.pool = null;
	}
	createPool(configFilePath:string):any {
		if(!Util.testJsonFile(configFilePath)) {
			throw new Error('The parameter must be a json file!');
		}
		try {
			const bf = fs.readFileSync(configFilePath, Util.baseData.encode);
			const config = JSON.parse(bf.toString());
			const {host,user,password,database,connectionLimit} = config.dataSource;
			this.pool = mysql.createPool({
                host,user,password,database,connectionLimit,
            });
            Util.baseData.configFileDir = path.dirname(configFilePath);
            Util.baseData.configOptions = config;
		}
		catch(err) {
			throw err;
		}
        return this;
    }
    openSession():Promise<any> {
        return new Promise((resolve:Function, reject:Function) => {
            this.pool.getConnection((err:any, connection:any) => {
                if(err) {
                    reject(err);
                    return;
                }
                this.methodQuote(connection);
                resolve(connection);
            });
        });
    }
    private methodQuote(target:any):void {
    	const targetPrototype = target.constructor.prototype,
            srcPrototype = IndirectConnection.prototype,
    	    methodNames = Object.getOwnPropertyNames(srcPrototype);
        for(let name of methodNames) {
            if(name != 'constructor' && Util.isValidKey(name, srcPrototype)) {
                targetPrototype[name] = srcPrototype[name];
            }    		
    	}
    }
}