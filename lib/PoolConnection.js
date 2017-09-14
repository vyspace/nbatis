'use strict';

const SUtil = require('./SUtil'),
    _methods = Symbol('methods'),
    _mappers = Symbol('mappers'),
    _cget = Symbol('cget'),
    _cset = Symbol('cset');
let _this = null;
class PoolConnection {
    constructor(mappers) {
        _this = this;
        this[_mappers] = mappers;
        this[_methods] = ['selectOne', 'selectList', 'insert', 'update', 'delete', 'commits', 'rollbacks'];
    }
    * [Symbol.iterator]() {
        for (const item of this[_methods]) {
            yield item;
        }
    }
    [_cget](tag, param, conn) {
        const arr = SUtil.mapperHandler(tag, param, conn.mappers);
        return new Promise((resolve, reject) => {
            conn.query(arr[0].sql, arr[0].paramArray, (err, rows) => {
                if(err) {
                    reject(err);
                }
                else{
                    resolve(rows);
                }
            });
        });
    }
    [_cset](tag, param, conn) {
        const arr = SUtil.mapperHandler(tag, param, conn.mappers);
        return new Promise((resolve, reject) => {
            conn.beginTransaction((err) => {
                if(err) {
                    throw err;
                }
                this.doQuery(conn, arr, 0, resolve, reject);
            });
        });
    }
    doQuery(conn, arr, index, resolve, reject) {
        conn.query(arr[index].sql, arr[index].paramArray, (error) => {
            if (error) {
                return conn.rollback(() => {
                    reject(error);
                });
            }
            const plus = index + 1;
            if(plus < arr.length) {
                this.doQuery(conn, arr, plus, resolve, reject);
            }
            else {
                conn.commit((commitError) => {
                    if (commitError) {
                        return conn.rollback(() => {
                            reject(commitError);
                        });
                    }
                    resolve();
                });
            }
        });
    }
    async selectOne(tag, param) {
        let result = null;
        try {
            const rows = await _this[_cget](tag, param, this);
            if(rows && rows.length > 0) {
                result = rows[0];
            }
        }
        catch(err) {
            throw err;
        }
        return result;
    }
    async selectList(tag, param) {
        let result = null;
        try {
            const rows = await _this[_cget](tag, param, this);
            if(rows && rows.length > 0) {
                result = rows;
            }
        }
        catch(err) {
            throw err;
        }
        return result;
    }
    async insert(tag, param) {
        try {
            await _this[_cset](tag, param, this);
        }
        catch(err) {
            throw err;
        }
    }
    async update(tag, param) {
        try {
            await _this[_cset](tag, param, this);
        }
        catch(err) {
            throw err;
        }
    }
    async delete(tag, param) {
        try {
            await _this[_cset](tag, param, this);
        }
        catch(err) {
            throw err;
        }
    }
}

module.exports = PoolConnection;

