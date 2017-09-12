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
        const obj = SUtil.mapperHandler(tag, param, conn.mappers);
        return new Promise((resolve, reject) => {
            conn.query(obj.sql, obj.paramArray, (err, rows) => {
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
        const obj = SUtil.mapperHandler(tag, param, conn.mappers);
        return new Promise((resolve, reject) => {
            conn.beginTransaction((err) => {
                if(err) {
                    reject(err);
                }
                else {
                    conn.query(obj.sql, obj.paramArray, (err, rows) => {
                        if(err) {
                            reject(err);
                        }
                        else{
                            resolve(rows);
                        }
                    });
                }
            });
        });
    }
    async selectOne(tag, param) {
        if(!tag) {
            return null;
        }
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
        if(!tag || !param) {
            return null;
        }
        let result = null;
        try {
            const rows = await _this[_cget](tag, param, this);
            if(rows && rows.length > 0){
                result = rows;
            }
        }
        catch(err) {
            throw err;
        }
        return result;
    }

    async insert(tag, param) {
        if(!tag || !param) {
            return;
        }
        try {
            await _this[_cset](tag, param, this);
        }
        catch(err) {
            throw err;
        }
    }
    async update(tag, param) {
        if(!tag || !param) {
            return;
        }
        try {
            await _this[_cset](tag, param, this);
        }
        catch(err) {
            throw err;
        }
    }
    async delete(tag, param) {
        if(!tag || !param) {
            return;
        }
        try {
            await _this[_cset](tag, param, this);
        }
        catch(err) {
            throw err;
        }
    }
    commits() {
        return new Promise((resolve, reject) => {
            this.commit((err)=>{
                if(err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    rollbacks() {
        return new Promise((resolve, reject) => {
            this.rollback((err)=>{
                if(err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
}

module.exports = PoolConnection;

