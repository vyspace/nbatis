"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Core_1 = __importDefault(require("./Core"));
class BaseConnection {
    doGet(tag, params, connection) {
        const resList = Core_1.default.mapperHandler(tag, params);
        return new Promise((resolve, reject) => {
            connection.query(resList[0].sql, resList[0].paramsList, (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }
    doSet(tag, params, connection) {
        const resList = Core_1.default.mapperHandler(tag, params);
        return new Promise((resolve, reject) => {
            connection.beginTransaction((beginErr, beginData) => {
                if (beginErr) {
                    reject(beginErr);
                }
                BaseConnection.commitQuery(connection, resList, 0, resolve, reject);
            });
        });
    }
    sqlGet(sqlStr, connection) {
        return new Promise((resolve, reject) => {
            connection.query(sqlStr, null, (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }
    sqlSet(sqlStr, connection) {
        return new Promise((resolve, reject) => {
            connection.beginTransaction((beginErr, beginData) => {
                if (beginErr) {
                    reject(beginErr);
                }
                const sqlList = [{
                        sql: sqlStr,
                        paramsList: null
                    }];
                BaseConnection.commitQuery(connection, sqlList, 0, resolve, reject);
            });
        });
    }
    static commitQuery(connection, resList, index, resolve, reject, okList) {
        let okPacketList = [];
        if (okList) {
            okPacketList = okList;
        }
        connection.query(resList[index].sql, resList[index].paramsList, (handleErr, handleData) => {
            if (handleErr) {
                return connection.rollback(() => {
                    reject(handleErr);
                });
            }
            okPacketList.push(handleData);
            const plus = index + 1;
            if (plus < resList.length) {
                BaseConnection.commitQuery(connection, resList, plus, resolve, reject, okPacketList);
            }
            else {
                connection.commit((FinishErr, FinishData) => {
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
exports.default = BaseConnection;
