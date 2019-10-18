export default class Util {
    constructor();
    static baseData: any;
    static testJsonFile(path: string): boolean;
    static isValidKey(key: string, obj: Object): key is keyof typeof obj;
    static litterCamelCaseToUnderline(litterCamelStr: string): string;
    static getRandomDouble(max?: number, min?: number): number;
    static getRandomValue(dataList: Array<any>): any;
    static getDateString(ms: number): string;
    static getTimeString24(ms: number): string;
    static getTopDomain(): string;
}
