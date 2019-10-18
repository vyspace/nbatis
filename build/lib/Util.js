"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseData_1 = __importDefault(require("./BaseData"));
class Util {
    constructor() {
        throw new Error('This is a static class!');
    }
    static testJsonFile(path) {
        return /\.json$/i.test(path);
    }
    static isValidKey(key, obj) {
        return key in obj;
    }
    static litterCamelCaseToUnderline(litterCamelStr) {
        const res = litterCamelStr.replace(/([A-Z]+)/g, $1 => '_' + $1.toLowerCase());
        return res.replace(/^_/, '');
    }
    static getRandomDouble(max, min) {
        if (max == null || max == undefined) {
            max = 1;
        }
        if (min == null || min == undefined) {
            min = 0;
        }
        return Math.random() * (max - min) + min;
    }
    static getRandomValue(dataList) {
        const max = dataList.length - 1, randomIndex = Math.round(Util.getRandomDouble(max));
        return dataList[randomIndex];
    }
    static getDateString(ms) {
        const str = new Date(ms).toLocaleDateString(), dl = str.split('/');
        return `${dl[2]}-${dl[0]}-${dl[1]}`;
    }
    static getTimeString24(ms) {
        const str = new Date(ms).toLocaleTimeString(), dl = str.split(' ');
        let tl = null, res = null;
        if ((dl[1]) === 'PM') {
            tl = dl[0].split(':');
            tl[0] = (Number(tl[0]) + 12).toString();
            res = tl.join(':');
        }
        else {
            res = dl[0];
        }
        return res;
    }
    static getTopDomain() {
        return Util.getRandomValue(['com', 'cn', 'com.cn', 'org', 'net']);
    }
}
Util.baseData = Object.seal(new BaseData_1.default());
exports.default = Util;
