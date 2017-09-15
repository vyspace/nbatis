'use strict';

const path = require('path');
class SUtil {
    /* 按照全局配置的mappers获取每一个类中指定的sql语句
     * mappers 每一个类对应的mapper文件
     * tag 类+id的标签
     * param 参数
     * 返回找到的sql语句
     */
    static mapperHandler(tag, param, mappers) {
        const tagArr = tag.split('.'),
            mapperAPath = path.join(mappers.configAbsPath, mappers[tagArr[0]]),
            sqlConfig = require(mapperAPath),
            tagObj = sqlConfig[tagArr[1]],
            result = SUtil.paramHandler(tagObj, param);
        return result;
    }
    /* 将sql中的值做替换
     * tagObj mapper文件中tag对象
     * param 参数值
     * 返回doParamHandler处理后的数组
     */
    static paramHandler(tagObj, param) {
        let sql = tagObj.sql.trim();
        const result = [];
        if(tagObj.dynamic) {
            sql = SUtil.dynamicHandler(tagObj, param);
        }
        const sqlArray = SUtil.multiSQL(sql);
        for(let i = 0; i < sqlArray.length; i += 1) {
            result.push(SUtil.doParamHandler(sqlArray[i], tagObj.parameterType, param));
        }
        return result;
    }
    /* 循环执行
     * sql 当次需要处理的sql语句
     * parameterType 参数类型（object或其他）
     * param 参数值
     * 返回包含已处理的sql语句和参数数组的对象
     */
    static doParamHandler(sql, parameterType, param) {
        const reg1 = /\${(.+?)}/,
            reg2 = /#{(.+?)}/,
            paramArray = [];
        let match = null;
        do {
            match = reg1.exec(sql);
            if(match && match.length > 0) {
                if(parameterType === 'object') {
                    sql = sql.replace(match[0], param[match[1]]);
                }
                else {
                    sql = sql.replace(match[0], param);
                }
            }
            else{
                break;
            }
        }
        while (match !== null);
        do {
            match = reg2.exec(sql);
            if(match && match.length > 0) {
                sql = sql.replace(match[0], '?');
                if(parameterType === 'object') {
                    paramArray.push(param[match[1]]);
                }
                else {
                    paramArray.push(param);
                }
            }
            else{
                break;
            }
        }
        while(match !== null);
        return { sql, paramArray };
    }
    /* 动态SQL处理
     * tagObj mapper文件中tag对象
     * param 参数值
     * 返回sql语句
     */
    static dynamicHandler(tagObj, param) {
        const reg1 = /<%(.+?)%>/,
            reg2 = /{{(.+?)}}/;
        let sql = tagObj.sql,
            match1 = null,
            match2 = null;
        do {
            match1 = reg1.exec(sql);
            if(match1 && match1.length > 0) {
                do {
                    match2 = reg2.exec(match1[1]);
                    if(match2 && match2.length > 0) {
                        let p = null;
                        if(tagObj.parameterType === 'object') {
                            p = param[match2[1]];
                        }
                        else {
                            p = param;
                        }
                        if (p) {
                            if (typeof p === 'string') {
                                p = `'${p}'`;
                            }
                            match1[1] = match1[1].replace(match2[0], p);
                        }
                        if(!p) {
                            match1[1] = match1[1].replace(match2[0], false);
                        }
                    }
                    else {
                        break;
                    }
                }
                while(match2 !== null);
                let part = new Function(match1[1])();
                if(!part) {
                    part = '';
                }
                sql = sql.replace(match1[0], part);
            }
            else{
                break;
            }
        }
        while(match1 !== null);
        return sql;
    }
    /* 判断是否多条SQL，并处理
     * sql 从mapper文件中得到的原始sql
     * 如果一条返回此条数组，否则返回多条数组
     */
    static multiSQL(sql) {
        if(/;/.test(sql)) {
            return sql.split(';').filter(cell => cell !== '');
        }
        else {
            return [sql];
        }
    }
}

module.exports = SUtil;