export default class SqlSessionTemplate {
    factory: any;
    constructor(path: string);
    selectList(tag: string, params: any): Promise<any>;
    selectOne(tag: string, params: any): Promise<any>;
    insert(tag: string, params: any): Promise<any>;
    update(tag: string, params: any): Promise<any>;
    delete(tag: string, params: any): Promise<any>;
    queryGet(sql: string): Promise<any>;
    querySet(sql: string): Promise<any>;
    private pormiseFactory;
    getFactory(): any;
}
