import DBUtil from '../lib/DBUtil';

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