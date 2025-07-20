import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

export class DatabaseConnector {
  private db: any;
  private client: any;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('⚠️ DATABASE_URL not found, database operations will be limited');
      this.client = null;
      this.db = null;
      return;
    }

    this.client = postgres(databaseUrl);
    this.db = drizzle(this.client);
  }

  async connect(): Promise<void> {
    if (!this.client) {
      throw new Error('No database connection available - DATABASE_URL not configured');
    }
    
    try {
      // Test the connection
      await this.client`SELECT 1`;
      console.log('✅ Database connection established');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async getDatabaseInfo(): Promise<any> {
    if (!this.client) {
      return {
        tables: [],
        totalTables: 0,
        connectionStatus: 'not_configured',
        error: 'DATABASE_URL not configured'
      };
    }
    
    try {
      // Get all tables in the database
      const tables = await this.client`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;

      // Get table details
      const tableDetails = await Promise.all(
        tables.map(async (table: any) => {
          const columns = await this.client`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = ${table.table_name}
            ORDER BY ordinal_position
          `;
          
          return {
            name: table.table_name,
            columns: columns.map((col: any) => ({
              name: col.column_name,
              type: col.data_type,
              nullable: col.is_nullable === 'YES',
              default: col.column_default
            }))
          };
        })
      );

      return {
        tables: tableDetails,
        totalTables: tables.length,
        connectionStatus: 'connected'
      };
    } catch (error) {
      console.error('Error getting database info:', error);
      return {
        tables: [],
        totalTables: 0,
        connectionStatus: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async runMigration(): Promise<void> {
    if (!this.db) {
      throw new Error('No database connection available - DATABASE_URL not configured');
    }
    
    try {
      console.log('🔄 Running database migrations...');
      await migrate(this.db, { migrationsFolder: './drizzle' });
      console.log('✅ Migrations completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  async queryTable(tableName: string): Promise<any> {
    if (!this.client) {
      return {
        tableName,
        rowCount: 0,
        data: [],
        error: 'No database connection available'
      };
    }
    
    try {
      const result = await this.client`SELECT * FROM ${this.client(tableName)} LIMIT 10`;
      return {
        tableName,
        rowCount: result.length,
        data: result
      };
    } catch (error) {
      console.error(`Error querying table ${tableName}:`, error);
      return {
        tableName,
        rowCount: 0,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getTableSchema(tableName: string): Promise<any> {
    if (!this.client) {
      return {
        tableName,
        columns: [],
        error: 'No database connection available'
      };
    }
    
    try {
      const columns = await this.client`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = ${tableName}
        ORDER BY ordinal_position
      `;

      return {
        tableName,
        columns: columns.map((col: any) => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === 'YES',
          default: col.column_default,
          maxLength: col.character_maximum_length
        }))
      };
    } catch (error) {
      console.error(`Error getting schema for table ${tableName}:`, error);
      return {
        tableName,
        columns: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.end();
    }
  }

  async executeSQL(sql: string): Promise<any> {
    if (!this.client) {
      throw new Error('No database connection available');
    }
    
    try {
      console.log(`🔧 Executing SQL: ${sql.substring(0, 50)}...`);
      const result = await this.client.unsafe(sql);
      console.log(`✅ SQL executed successfully`);
      return result;
    } catch (error) {
      console.error(`❌ SQL execution failed:`, error);
      throw error;
    }
  }

  async dropTable(tableName: string): Promise<void> {
    if (!this.client) {
      throw new Error('No database connection available');
    }
    
    try {
      console.log(`🗑️ Dropping table: ${tableName}`);
      await this.client`DROP TABLE IF EXISTS ${this.client(tableName)} CASCADE`;
      console.log(`✅ Table ${tableName} dropped successfully`);
    } catch (error) {
      console.error(`❌ Failed to drop table ${tableName}:`, error);
      throw error;
    }
  }

  async dropAllTables(): Promise<void> {
    if (!this.client) {
      throw new Error('No database connection available');
    }
    
    try {
      console.log(`🗑️ Dropping all tables...`);
      
      // Get all table names
      const tables = await this.client`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      `;
      
      // Drop each table
      for (const table of tables) {
        await this.client`DROP TABLE IF EXISTS ${this.client(table.table_name)} CASCADE`;
        console.log(`✅ Dropped table: ${table.table_name}`);
      }
      
      console.log(`✅ All tables dropped successfully`);
    } catch (error) {
      console.error(`❌ Failed to drop all tables:`, error);
      throw error;
    }
  }

  async createTable(tableName: string, columns: string[]): Promise<void> {
    if (!this.client) {
      throw new Error('No database connection available');
    }
    
    try {
      console.log(`🏗️ Creating table: ${tableName}`);
      const createSQL = `CREATE TABLE IF NOT EXISTS "${tableName}" (
        ${columns.join(',\n        ')}
      )`;
      
      await this.client.unsafe(createSQL);
      console.log(`✅ Table ${tableName} created successfully`);
    } catch (error) {
      console.error(`❌ Failed to create table ${tableName}:`, error);
      throw error;
    }
  }

  async addColumn(tableName: string, columnName: string, columnDefinition: string): Promise<void> {
    if (!this.client) {
      throw new Error('No database connection available');
    }
    
    try {
      console.log(`➕ Adding column ${columnName} to table ${tableName}`);
      const alterSQL = `ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "${columnName}" ${columnDefinition}`;
      
      await this.client.unsafe(alterSQL);
      console.log(`✅ Column ${columnName} added successfully`);
    } catch (error) {
      console.error(`❌ Failed to add column ${columnName}:`, error);
      throw error;
    }
  }

  async removeColumn(tableName: string, columnName: string): Promise<void> {
    if (!this.client) {
      throw new Error('No database connection available');
    }
    
    try {
      console.log(`➖ Removing column ${columnName} from table ${tableName}`);
      const alterSQL = `ALTER TABLE "${tableName}" DROP COLUMN IF EXISTS "${columnName}"`;
      
      await this.client.unsafe(alterSQL);
      console.log(`✅ Column ${columnName} removed successfully`);
    } catch (error) {
      console.error(`❌ Failed to remove column ${columnName}:`, error);
      throw error;
    }
  }
} 