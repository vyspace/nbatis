import Util from './Util';

export default class DBUtil {
	static createTableSQL(typeReference:any, tableName?:string):string {
		const tempObj = new typeReference(),
			properties = Object.keys(tempObj),
			propertyList = [];
		let firstFlag = true,
			sqlStr = '',
			propName = '',
			prop:any = null
        if(!tableName) {
            tableName = Util.litterCamelCaseToUnderline(typeReference.name);
        }
		if(properties.length > 0) {
			for(propName of properties) {
				const itemList = [];
				prop = tempObj[propName];
				itemList.push(Util.litterCamelCaseToUnderline(propName));
				if(prop.type) itemList.push(prop.type);
				if(prop.primary) {
					if(firstFlag) {
						itemList.push('PRIMARY KEY AUTO_INCREMENT');
						firstFlag = false;
					}
					else {
						throw new Error('There is only one primary key in a table!');
					}
				}
				else {
					if(prop.notNull) itemList.push('NOT NULL');
					if(prop.default!=null && prop.default!=undefined) {
						if(/char|text/i.test(prop.type)){
							itemList.push('DEFAULT "'+prop.default+'"');
						}
						else if(/date|time/i.test(prop.type)){
							if(/#{[A-Za-z0-9\(\)]+}/i.test(prop.default)) {
								itemList.push('DEFAULT '+prop.default.replace(/[#{}]/g, ''));
							}
							else {
								itemList.push('DEFAULT "'+prop.default+'"');
							}
						}
					}
				}
				propertyList.push(itemList.join(' '));
			}
			sqlStr = `CREATE TABLE ${tableName} (${propertyList.join(',')}) DEFAULT CHARSET=utf8`;
		}
		return sqlStr;
	}
	static batchInsertSQL(typeReference:any, tableName?:string, dataNumber?:number):string {
		dataNumber = dataNumber || 10;
		const tempObj = new typeReference(),
			properties = Object.keys(tempObj),
			propertyNameList = [],
			batchValueList = [];
		let sqlStr = '',
			propName = '',
			prop:any = null,
			tempValue = '';
        if(!tableName) {
            tableName = Util.litterCamelCaseToUnderline(typeReference.name);
        }
		if(properties.length > 0) {
			for(let i=0; i<dataNumber; i++) {
				const itemList:any = [];
				for(propName of properties) {
					prop = tempObj[propName];
					if(prop.value && !prop.primary) {
						if(i === 0) {
							propertyNameList.push(Util.litterCamelCaseToUnderline(propName));
						}
						if(typeof(prop.value) === 'function') {
							tempValue = prop.value();
						}
						else {
							tempValue = prop.value;
						}
						if(/char|text|date|time/i.test(prop.type)) {
							tempValue = '"'+tempValue+'"';
						}
						itemList.push(tempValue);
					}
				}
				batchValueList.push(`(${itemList.join(',')})`);
			}
			sqlStr = `INSERT INTO ${tableName} (${propertyNameList.join(',')}) VALUES ${batchValueList.join(',')}`;
		}
		return sqlStr;
	}
    /**
     * params: 可以是类，也可以是表名
     */
    static dropTableSQL(params:any):string {
        let tableName:string = '',
            sqlStr = '';
        if(typeof(params) === 'function') {
            tableName = Util.litterCamelCaseToUnderline(params.name);
        }
        else if(typeof(params) === 'string') {
            tableName = params;
        }
        else {
            throw new Error('The type of parameter is wrong，it\'s a class or table name!');
        }
        sqlStr = `DROP TABLE IF EXISTS ${tableName}`;
        return sqlStr;
    }
	/**
     * tag: w字符数字，c字符，d数字
     * letterCase: l小写，b大写，m大小写都有
     */
    static randomString(tag:string, letterCase?:string, len?:number):string {
    	len = len || 10;
    	letterCase = letterCase || '';
    	const little = 'abcdefhijkmnprstwxyz',
    		big = 'ABCDEFGHJKMNPQRSTWXYZ',
    		num = '2345678';
    	let chars = '';
    	if(tag === 'c') {
    		if(letterCase == 'l') {
				chars = little;
    		}
    		else if(letterCase == 'b') {
    			chars = big;
    		}
    		else {
    			chars = big + little;
    		}
    	}
    	if(tag === 'd') {
    		chars = num;
    	}
    	if(tag === 'w') {
    		if(letterCase == 'l') {
				chars = little+num;
    		}
    		else if(letterCase == 'b') {
    			chars = big+num;
    		}
    		else {
    			chars = big+little+num;
    		}
    	}
    	let str = '';
    	for(let i=0; i<len; i++) {
    		str += chars.charAt(Math.floor(Math.random() * chars.length))
    	}
    	return str;
    }
    /**
     * startDate开始日期，默认为1970-01-01，格式yyyy-MM-dd
     * endDate结束日期，默认为当前时间，格式yyyy-MM-dd
     * returnFormat 返回字符串样式yyyy-MM-dd或者yyyy-MM-dd hh:mm:ss
     */
    static randomDateTimeString(startDate?:string, endDate?:string, returnFormat?:string):string {
    	let startMs =0,
    		endMs = 0,
    		resMs = 0,
    		resFlag = 0,
    		res = '';
    	if(startDate) {
    		if(/\d{4}-\d{1,2}-\d{1,2}/.test(startDate)) {
    			startMs = new Date(startDate).getTime();
    		}
    		else {
    			throw new Error('The first parameter format is wrong, the format is 1970-01-01');
    		}
    	}
    	if(endDate) {
    		if(/\d{4}-\d{1,2}-\d{1,2}/.test(endDate)) {
    			endMs = new Date(endDate).getTime();
    		}
    		else {
    			throw new Error('The second parameter format is wrong, the format is 1970-01-01');
    		}
    	}
        else {
            endMs = new Date().getTime();
        }
    	if(returnFormat) {
    		if(/^yyyy-MM-dd$/.test(returnFormat)) {
    			resFlag = 0;
    		}
    		else if(/^yyyy-MM-dd\shh:mm:ss$/.test(returnFormat)) {
    			resFlag = 1;
    		}
    		else if(/^hh:mm:ss$/.test(returnFormat)) {
    			resFlag = 2;
    		}
    		else {
    			throw new Error('The third parameter format is wrong, the format is yyyy-MM-dd hh:mm:ss');
    		}
    	}
    	else {
    		returnFormat = 'yyyy-MM-dd';
    	}
    	resMs = Math.round(Util.getRandomDouble(endMs, startMs));
        switch(resFlag) {
            case 0:
                res = Util.getDateString(resMs);
                break;
            case 1:
                res = Util.getDateString(resMs)+' '+Util.getTimeString24(resMs);
                break;
            case 2:
                res = Util.getTimeString24(resMs);
                break;
            default:
                break;
        }
        return res;
    }
    static randomValueFromList(dataList:Array<any>):string {
        return Util.getRandomValue(dataList);
    }
    static randomEmail():string {
        let strLen = Math.round(Util.getRandomDouble(8,3));
        const username = DBUtil.randomString('w','l',strLen);
        strLen = Math.round(Util.getRandomDouble(8,2));
        const second = DBUtil.randomString('c','l',strLen),
            top = Util.getTopDomain();
        return `${username}@${second}.${top}`
    }
    /**
     * isSubDomain为true 返回二级域名，否则返回顶级域名
     */
    static randomDomain(isSubDomain?:boolean):string {
        let third = 'www',
            strLen = 0,
            second = '';
        if(isSubDomain) {
            strLen = Math.round(Util.getRandomDouble(8,3));
            third = DBUtil.randomString('c','l',strLen);
        }
        strLen = Math.round(Util.getRandomDouble(8,2));
        second = DBUtil.randomString('c','l',strLen);
        const top = Util.getTopDomain();
        return `${third}.${second}.${top}`
    }
    /**
     * birthday生日，格式yyyy-MM-dd
     */
    static birthdayToAge(birthday:string):number {
        let startMs = 0;
        if(birthday) {
            if(/\d{4}-\d{1,2}-\d{1,2}/.test(birthday)) {
                startMs = new Date(birthday).getTime();
            }
            else {
                throw new Error('The parameter format is wrong, the format is 1970-01-01');
            }
        }
        const endMs = new Date().getTime(),
            oneYearMs = 31536000000;
        return Math.floor((endMs - startMs) / oneYearMs);
    }	
}