export default class DBUtil {
    static createTableSQL(typeReference: any, tableName?: string): string;
    static batchInsertSQL(typeReference: any, tableName?: string, dataNumber?: number): string;
    static dropTableSQL(params: any): string;
    static randomString(tag: string, letterCase?: string, len?: number): string;
    static randomDateTimeString(startDate?: string, endDate?: string, returnFormat?: string): string;
    static randomValueFromList(dataList: Array<any>): string;
    static randomEmail(): string;
    static randomDomain(isSubDomain?: boolean): string;
    static birthdayToAge(birthday: string): number;
}
