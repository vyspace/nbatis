export default class SqlSessionFactory {
    private pool;
    constructor();
    createPool(configFilePath: string): any;
    getPool(): any;
    openSession(): Promise<any>;
    private methodQuote;
}
