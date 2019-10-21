"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SqlSessionFactory_1 = __importDefault(require("./SqlSessionFactory"));
class SqlSessionTemplate {
    constructor(path) {
        this.factory = new SqlSessionFactory_1.default().createPool(path);
    }
    selectList(tag, params) {
        return this.pormiseFactory('selectList', tag, params, '', false);
    }
    selectOne(tag, params) {
        return this.pormiseFactory('selectOne', tag, params, '', false);
    }
    insert(tag, params) {
        return this.pormiseFactory('insert', tag, params, '', true);
    }
    update(tag, params) {
        return this.pormiseFactory('update', tag, params, '', true);
    }
    delete(tag, params) {
        return this.pormiseFactory('delete', tag, params, '', true);
    }
    queryGet(sql) {
        return this.pormiseFactory('queryGet', '', null, sql, true);
    }
    querySet(sql) {
        return this.pormiseFactory('querySet', '', null, sql, true);
    }
    pormiseFactory(methodName, tag, params, sql, isSet) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let session, res = null;
            try {
                session = yield this.factory.openSession();
                if (sql) {
                    res = yield session[methodName](sql);
                }
                else {
                    res = yield session[methodName](tag, params);
                }
            }
            catch (err) {
                if (isSet && session) {
                    session.rollback();
                }
                reject(err);
            }
            finally {
                if (session) {
                    session.release();
                }
                resolve(res);
            }
        }));
    }
    getFactory() {
        return this.factory;
    }
}
exports.default = SqlSessionTemplate;
