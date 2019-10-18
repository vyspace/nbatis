import BaseData from './BaseData';

export default class Util {
	constructor() {
		throw new Error('This is a static class!');
	}
	static baseData:any = Object.seal(new BaseData());

	static testJsonFile(path:string) {
		return /\.json$/i.test(path);
	}
	static isValidKey(key:string, obj:Object): key is keyof typeof obj {
        return key in obj;
    }
    static litterCamelCaseToUnderline(litterCamelStr:string):string {
    	const res = litterCamelStr.replace(/([A-Z]+)/g, $1=>'_'+$1.toLowerCase())
    	return res.replace(/^_/, '');
    }
    static getRandomDouble(max?:number, min?:number):number {
    	if(max==null||max==undefined) {
    		max = 1;
    	}
    	if(min==null||min==undefined) {
    		min = 0;
    	}
    	return Math.random() * (max - min) + min;
    }
    static getRandomValue(dataList:Array<any>):any {
    	const max = dataList.length - 1,
    		randomIndex = Math.round(Util.getRandomDouble(max));
    	return dataList[randomIndex];
    }
    static getDateString(ms:number):string {
        const str = new Date(ms).toLocaleDateString(),
        	dl = str.split('/');
        return `${dl[2]}-${dl[0]}-${dl[1]}`;
    }
    static getTimeString24(ms:number):string {
        const str = new Date(ms).toLocaleTimeString(),
        	dl = str.split(' ');
       	let tl = null,
       		res = null;
        if((dl[1]) === 'PM'){
        	tl = dl[0].split(':');
        	tl[0] = (Number(tl[0])+12).toString();
        	res = tl.join(':');
		}
		else {
			res = dl[0];
		}
        return res;
    }
    static getTopDomain():string {
    	return Util.getRandomValue(['com','cn','com.cn','org','net'])
    }
}