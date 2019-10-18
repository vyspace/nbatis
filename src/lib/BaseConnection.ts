import Core from './Core';

export default class BaseConnection {
	protected doGet(tag:string, params:any, connection:any):Promise<any> {
        const resList = Core.mapperHandler(tag, params);
        return new Promise((resolve:Function, reject:Function) => {
            connection.query(resList[0].sql, resList[0].paramsList, (err:any, rows:any) => {
                if(err) {
                    reject(err);
                }
                else{
                    resolve(rows);
                }
            });         
        });
    }
    protected doSet(tag:string, params:any, connection:any):Promise<any> {
        const resList = Core.mapperHandler(tag, params);
        return new Promise((resolve:Function, reject:Function) => {
            connection.beginTransaction((beginErr:any, beginData:any) => {
                if(beginErr) {
                    reject(beginErr);
                }
                BaseConnection.commitQuery(connection, resList, 0, resolve, reject);
            });
        });
    }
    protected sqlGet(sqlStr:string, connection:any):Promise<any> {
        return new Promise((resolve:Function, reject:Function) => {
            connection.query(sqlStr, null, (err:any, rows:any) => {
                if(err) {
                    reject(err);
                }
                else{
                    resolve(rows);
                }
            });         
        });
    }
    protected sqlSet(sqlStr:string, connection:any):Promise<any> {
        return new Promise((resolve:Function, reject:Function) => {
            connection.beginTransaction((beginErr:any, beginData:any) => {
                if(beginErr) {
                    reject(beginErr);
                }
                const sqlList = [{
                    sql:sqlStr,
                    paramsList: null
                }]
                BaseConnection.commitQuery(connection, sqlList, 0, resolve, reject);
            });
        });
    }
    private static commitQuery(connection:any, resList:Array<any>, index:number, resolve:Function, reject:Function, okList?:Array<any>):void {
        let okPacketList:Array<any> = [];
        if(okList) {
            okPacketList = okList;
        }
    	connection.query(resList[index].sql, resList[index].paramsList, (handleErr:any, handleData:any) => {
            if (handleErr) {
                return connection.rollback(() => {
                    reject(handleErr);
                });
            }
            okPacketList.push(handleData);
            const plus = index + 1;
            if(plus < resList.length) {
                BaseConnection.commitQuery(connection, resList, plus, resolve, reject, okPacketList);
            }
            else {
                connection.commit((FinishErr:any, FinishData:any) => {
                    if (FinishErr) {
                        return connection.rollback(() => {
                            reject(FinishErr);
                        });
                    }
                    okPacketList.push(FinishData);
                    resolve(okPacketList);
                });
            }
        });
    }
}