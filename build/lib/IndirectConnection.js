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
const BaseConnection_1 = __importDefault(require("./BaseConnection"));
class IndirectConnection extends BaseConnection_1.default {
    selectList(tag, params) {
        const _super = Object.create(null, {
            doGet: { get: () => super.doGet }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let result = null;
            try {
                const rows = yield _super.doGet.call(this, tag, params, this);
                if (rows && rows.length > 0) {
                    result = rows;
                }
            }
            catch (err) {
                throw err;
            }
            finally {
                return result;
            }
        });
    }
    selectOne(tag, params) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = null;
            result = yield this.selectList(tag, params);
            if (result && result.length > 0) {
                return result[0];
            }
            else {
                return result;
            }
        });
    }
    insert(tag, params) {
        const _super = Object.create(null, {
            doSet: { get: () => super.doSet }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield _super.doSet.call(this, tag, params, this);
            }
            catch (err) {
                throw err;
            }
        });
    }
    update(tag, params) {
        const _super = Object.create(null, {
            doSet: { get: () => super.doSet }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield _super.doSet.call(this, tag, params, this);
            }
            catch (err) {
                throw err;
            }
        });
    }
    delete(tag, params) {
        const _super = Object.create(null, {
            doSet: { get: () => super.doSet }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield _super.doSet.call(this, tag, params, this);
            }
            catch (err) {
                throw err;
            }
        });
    }
    queryGet(sql) {
        const _super = Object.create(null, {
            sqlGet: { get: () => super.sqlGet }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield _super.sqlGet.call(this, sql, this);
            }
            catch (err) {
                throw err;
            }
        });
    }
    querySet(sql) {
        const _super = Object.create(null, {
            sqlSet: { get: () => super.sqlSet }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield _super.sqlSet.call(this, sql, this);
            }
            catch (err) {
                throw err;
            }
        });
    }
}
exports.default = IndirectConnection;
