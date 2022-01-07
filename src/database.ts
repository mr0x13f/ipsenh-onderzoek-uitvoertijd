import { Client, ClientConfig, QueryResult } from "pg";
import fs from 'fs';

export class Database {

    private client: Client;

    public constructor(config: ClientConfig) {
        this.client = new Client(config);
    }

    public async connect(): Promise<void> {
        return await this.client.connect();
    }

    public async runQuery<T>(query: string, values?: any[]): Promise<QueryResult<T>> {
        return await this.client.query<T>(query, values);
    }

    public async runQueryScript<T>(file: string, values?: any[]): Promise<QueryResult<T>> {
        const query = fs.readFileSync(file, 'utf8');
        return await this.runQuery<T>(query, values);
    }

}