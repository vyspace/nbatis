export default class BaseConnection {
    protected doGet(tag: string, params: any, connection: any): Promise<any>;
    protected doSet(tag: string, params: any, connection: any): Promise<any>;
    protected sqlGet(sqlStr: string, connection: any): Promise<any>;
    protected sqlSet(sqlStr: string, connection: any): Promise<any>;
    private static commitQuery;
}
