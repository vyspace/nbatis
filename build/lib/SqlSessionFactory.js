"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("mysql"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const IndirectConnection_1 = __importDefault(require("./IndirectConnection"));
const Util_1 = __importDefault(require("./Util"));
class SqlSessionFactory {
    constructor() {
        this.pool = null;
    }
    createPool(configFilePath) {
        if (!Util_1.default.testJsonFile(configFilePath)) {
            throw new Error('The parameter must be a json file!');
        }
        try {
            const bf = fs_1.default.readFileSync(configFilePath, Util_1.default.baseData.encode);
            const config = JSON.parse(bf.toString());
            const { host, user, password, database, connectionLimit } = config.dataSource;
            this.pool = mysql_1.default.createPool({
                host, user, password, database, connectionLimit,
            });
            Util_1.default.baseData.configFileDir = path_1.default.dirname(configFilePath);
            Util_1.default.baseData.configOptions = config;
        }
        catch (err) {
            throw err;
        }
        return this;
    }
    getPool() {
        return this.pool;
    }
    openSession() {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }
                this.methodQuote(connection);
                resolve(connection);
            });
        });
    }
    methodQuote(target) {
        const targetPrototype = target.constructor.prototype, srcPrototype = IndirectConnection_1.default.prototype, methodNames = Object.getOwnPropertyNames(srcPrototype);
        for (let name of methodNames) {
            if (name != 'constructor' && Util_1.default.isValidKey(name, srcPrototype)) {
                targetPrototype[name] = srcPrototype[name];
            }
        }
    }
}
exports.default = SqlSessionFactory;
