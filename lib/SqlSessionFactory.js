'use strict';

const mysql = require('mysql'),
    path = require('path'),
    PoolConnection = require('./PoolConnection'),
    _pool = Symbol('pool'),
    _shallowCopy = Symbol('shallowCopy'),
    _mappers = Symbol('mappers');
class SqlSessionFactory {
    constructor() {
        this[_pool] = null;
        this[_mappers] = null;
    }
    createPool(aPath) {
        const config = require(aPath),
            dataSource = config.dataSource;
        if(!this[_pool]) {
            config.mappers.configAbsPath = path.dirname(aPath);
            this[_mappers] = config.mappers;
            this[_pool] = mysql.createPool({
                host: dataSource.host,
                user: dataSource.user,
                password: dataSource.password,
                database: dataSource.database,
                connectionLimit: dataSource.connectionLimit
            });
        }
        return this;
    }
    openSession() {
        return new Promise((resolve) => {
            this[_pool].getConnection((err, connection) => {
                if(err) {
                    throw err;
                }
                const session = new PoolConnection();
                connection.mappers = this[_mappers];
                this[_shallowCopy](connection, session);
                resolve(connection);
            });
        });
    }
    [_shallowCopy](obj, src) {
        for (const item of src) {
            obj.constructor.prototype[item] = src.constructor.prototype[item];
        }
    }
}

module.exports = SqlSessionFactory;