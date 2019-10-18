"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const Util_1 = __importDefault(require("./Util"));
class Core {
    constructor() {
        throw new Error('This is a static class!');
    }
    static mapperHandler(tag, params) {
        let result;
        const configFileDir = Util_1.default.baseData.configFileDir, mappers = Util_1.default.baseData.configOptions.mappers;
        try {
            const tagList = tag.split('.'), mapperAbsPath = path_1.default.join(Util_1.default.baseData.configFileDir, mappers[tagList[0]]), bf = fs_1.default.readFileSync(mapperAbsPath, Util_1.default.baseData.encode), sqlConfig = JSON.parse(bf.toString()), tagObj = sqlConfig[tagList[1]];
            result = Core.paramsHandler(tagObj, params);
        }
        catch (err) {
            throw err;
        }
        finally {
            return result;
        }
    }
    static paramsHandler(tagObj, params) {
        let sql = tagObj.sql.trim();
        const result = [];
        if (tagObj.dynamic) {
            sql = Core.dynamicHandler(sql, params);
        }
        const sqlList = Core.multiSQL(sql);
        for (let item of sqlList) {
            result.push(Core.doParamsHandler(item, tagObj.parameterType, params));
        }
        return result;
    }
    static doParamsHandler(sql, parameterType, params) {
        return Core.sqlReplaceMark(Core.sqlJoint(sql, parameterType, params), parameterType, params);
    }
    static sqlJoint(sql, parameterType, params) {
        const reg = /\${[\w\$_]+}/g, regKey = /\${([\w\$_]+)}/, matchSet = new Set(sql.match(reg));
        let keyList = null, itemReg = null;
        if (matchSet && matchSet.size > 0) {
            for (let item of matchSet) {
                itemReg = new RegExp('\\' + item, 'g');
                if (parameterType === 'object') {
                    keyList = item.match(regKey);
                    if (keyList && keyList.length > 0) {
                        sql = sql.replace(itemReg, params[keyList[1]]);
                    }
                }
                else {
                    sql = sql.replace(itemReg, params);
                }
            }
        }
        return sql;
    }
    static sqlReplaceMark(sql, parameterType, params) {
        const reg = /#{[\w$_]+}/g, regKey = /#{([\w\$_]+)}/, paramsList = [], matchSet = new Set(sql.match(reg));
        let keyList = null, itemReg = null;
        if (matchSet && matchSet.size > 0) {
            for (let item of matchSet) {
                itemReg = new RegExp(item, 'g');
                sql = sql.replace(itemReg, '?');
                if (parameterType === 'object') {
                    keyList = item.match(regKey);
                    if (keyList && keyList.length > 0) {
                        paramsList.push(params[keyList[1]]);
                    }
                }
                else {
                    paramsList.push(params);
                }
            }
        }
        return { sql, paramsList };
    }
    static dynamicHandler(sql, params) {
        return Core.dynamicPhrase(Core.dynamicCondition(sql, params));
    }
    static dynamicCondition(sql, params) {
        const reg = /{{[\w$_]*}}/g, matchSet = new Set(sql.match(reg));
        let itemReg = null, key = '', substitute = '';
        if (matchSet && matchSet.size > 0) {
            for (let item of matchSet) {
                key = item.replace(/[{}]/g, '');
                itemReg = new RegExp(item, 'g');
                if (params[key] != null && params[key] != undefined) {
                    substitute = 'true';
                }
                else {
                    substitute = 'false';
                }
                sql = sql.replace(itemReg, substitute);
            }
        }
        return sql;
    }
    static dynamicPhrase(sql) {
        sql = sql.replace(/<%|%>/g, '§');
        const reg = /§[_{}();#'"&,%!><=+-/\w\s\[\]\|\\\.\*\$]+§/g, regKey = /§([_{}();#'"&,%!><=+-/\w\s\[\]\|\\\.\*\$]+)§/, matchList = sql.match(reg);
        let phrase = '', keyList = null;
        if (matchList && matchList.length > 0) {
            for (let item of matchList) {
                keyList = item.match(regKey);
                if (keyList && keyList.length > 0) {
                    phrase = new Function(keyList[1])();
                    if (!phrase) {
                        phrase = '';
                    }
                    sql = sql.replace(item, phrase);
                }
            }
        }
        return sql;
    }
    static multiSQL(sql) {
        if (/;/.test(sql)) {
            return sql.split(';').filter(cell => cell !== '');
        }
        else {
            return [sql];
        }
    }
}
exports.default = Core;
