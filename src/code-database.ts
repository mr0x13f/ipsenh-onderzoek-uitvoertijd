import { Config } from "./config";
import { Database } from "./database";

export class CodeDatabase {

    private database: Database;

    private constructor(database: Database) {
        this.database = database;
    }

    public async insertCode(sourceCode: string, minifiedCode: string): Promise<number> {
        const query = 'INSERT INTO code (source_code, minified_code) VALUES ($1, $2) RETURNING id;';
        const result = await this.database.runQuery<any>(query, [ sourceCode, minifiedCode ]);
        return result.rows[0]['id'];
    }

    public async getSourceCode(id: number) {
        const query = 'SELECT source_code FROM code WHERE id = $1;';
        const result = await this.database.runQuery<any>(query, [ id ]);
        return result.rows[0]['source_code'];
    }

    public async getMinifiedCode(id: number) {
        const query = 'SELECT minified_code FROM code WHERE id = $1;';
        const result = await this.database.runQuery<any>(query, [ id ]);
        return result.rows[0]['minified_code'];
    }

    public static async create(config: Config, databaseScriptPath: string) {
        const db = new Database(config.postgres);
        await db.connect();
        await db.runQueryScript(databaseScriptPath);
        return new CodeDatabase(db);
    }

}