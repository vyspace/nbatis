import path from 'path';
import fs from 'fs';
import Util from './Util';

export default class Core {
	constructor() {
		throw new Error('This is a static class!');
	}
	/** 
	 *按照全局配置的mappers获取每一个类中指定的sql语句
     * mappers 每一个类对应的mapper文件
     * tag 类+id的标签
     * params 参数
     * 返回找到的sql语句
     */
    static mapperHandler(tag:string, params:any):any {
    	let result:any;
    	const configFileDir = Util.baseData.configFileDir,
    		mappers = Util.baseData.configOptions.mappers;
    	try {
    		const tagList = tag.split('.'),
	            mapperAbsPath = path.join(Util.baseData.configFileDir, mappers[tagList[0]]),
	            bf = fs.readFileSync(mapperAbsPath, Util.baseData.encode),
	            sqlConfig = JSON.parse(bf.toString()),
	            tagObj = sqlConfig[tagList[1]];
            result = Core.paramsHandler(tagObj, params);
    	}
        catch(err) {
        	throw err;
        }
        finally {
        	return result;
        }
    }
    /* 将sql中的值做替换
     * tagObj mapper文件中tag对象
     * params 参数值
     * 返回doParamHandler处理后的数组
     */
    private static paramsHandler(tagObj:any, params:any):any {
        let sql = tagObj.sql.trim();
        const result = [];
        if(tagObj.dynamic) {
            sql = Core.dynamicHandler(sql, params);
        }
        const sqlList = Core.multiSQL(sql);
        for(let item of sqlList) {
            result.push(Core.doParamsHandler(item, tagObj.parameterType, params));
        }
        return result;
    }
    /* 循环执行
     * sql 当次需要处理的sql语句
     * parameterType 参数类型（object或其他）
     * params 参数值
     * 返回包含已处理的sql语句和参数数组的对象
     */
    private static doParamsHandler(sql:string, parameterType:string, params:any):any {
        return Core.sqlReplaceMark(Core.sqlJoint(sql, parameterType, params), parameterType, params); 
    }
    /**
     * SQL拼接
     * 将所有${}替换成参数进行拼接
     */
    private static sqlJoint(sql:string, parameterType:string, params:any):string {
        const reg = /\${[\w\$_]+}/g,
            regKey = /\${([\w\$_]+)}/,
            matchSet = new Set(sql.match(reg));
        let keyList = null,
            itemReg = null;
        if(matchSet && matchSet.size>0) {
            for(let item of matchSet) {
                itemReg = new RegExp('\\'+item, 'g');
                if(parameterType === 'object') {
                    keyList = item.match(regKey);
                    if(keyList && keyList.length>0) {
                        sql = sql.replace(itemReg, params[keyList[1]]);
                    }
                }
                else {
                    sql = sql.replace(itemReg, params);
                }
            }
        }
        return sql;
    }
    /**
     * SQL拼接
     * 将所有#{}替换成?进行拼接，并将参数放入新数组
     */
    private static sqlReplaceMark(sql:string, parameterType:string, params:any):any {
        const reg = /#{[\w$_]+}/g,
            regKey = /#{([\w\$_]+)}/,
            paramsList = [],
            matchSet = new Set(sql.match(reg));
        let keyList = null,
            itemReg = null;
        if(matchSet && matchSet.size>0) {
            for(let item of matchSet) {
                itemReg = new RegExp(item, 'g');
                sql = sql.replace(itemReg, '?');
                if(parameterType === 'object') {
                    keyList = item.match(regKey);
                    if(keyList && keyList.length>0) {
                        paramsList.push(params[keyList[1]]);
                    }
                }
                else {
                    paramsList.push(params);
                }
            }
        }
        return { sql, paramsList };
    }
    /* 动态SQL处理
     * tagObj mappers文件中tag对象
     * params 参数值
     * 返回sql语句
     */
    private static dynamicHandler(sql:string, params:any):string {
        return Core.dynamicPhrase(Core.dynamicCondition(sql, params));
    }
    private static dynamicCondition(sql:string, params:any):string {
        const reg = /{{[\w$_]*}}/g,
            matchSet = new Set(sql.match(reg));
        let itemReg = null,
            key = '',
            substitute = '';
        if(matchSet && matchSet.size>0) {
            for(let item of matchSet) {
                key = item.replace(/[{}]/g, '');
                itemReg = new RegExp(item, 'g');
                if(params[key]!=null&&params[key]!=undefined) {
                    substitute = 'true';
                }
                else {
                    substitute = 'false';
                }
                sql = sql.replace(itemReg, substitute);
            }
        }
        return sql;
    }
    private static dynamicPhrase(sql:string):string {
        sql = sql.replace(/<%|%>/g, '§');
        const reg = /§[_{}();#'"&,%!><=+-/\w\s\[\]\|\\\.\*\$]+§/g,
            regKey = /§([_{}();#'"&,%!><=+-/\w\s\[\]\|\\\.\*\$]+)§/,
            matchList = sql.match(reg);
        let phrase = '',
            keyList = null;
        if(matchList && matchList.length>0) {
            for(let item of matchList) {
                keyList = item.match(regKey);
                if(keyList && keyList.length>0) {
                    phrase = new Function(keyList[1])();
                    if(!phrase) {
                        phrase = '';
                    }
                    sql = sql.replace(item, phrase);
                }
            }
        }
        return sql;
    }
    /* 判断是否多条SQL，并处理
     * sql 从mappers文件中得到的原始sql
     * 如果一条返回此条数组，否则返回多条数组
     */
    private static multiSQL(sql:string):Array<string> {
        if(/;/.test(sql)) {
            return sql.split(';').filter(cell => cell !== '');
        }
        else {
            return [sql];
        }
    }
}