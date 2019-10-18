export default class BaseData {
	configFileDir:string
    configOptions:any
    encode:string
	constructor() {
		this.configFileDir = '';
		this.configOptions = null;
		this.encode = 'utf-8';
	}
}