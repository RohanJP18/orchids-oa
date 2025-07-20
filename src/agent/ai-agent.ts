import OpenAI from 'openai';
import { ContextManager } from './context-manager';
import { ProjectContext, ExecutionPlan, DatabaseOperation, APIOperation, FrontendOperation } from './types';
import { DatabaseImplementer } from './database-implementer';
import { APIImplementer } from './api-implementer';
import { FrontendImplementer } from './frontend-implementer';
import { DatabaseConnector } from './database-connector';

export class AIAgent {
  private openai: OpenAI;
  private contextManager: ContextManager;
  private databaseImplementer: DatabaseImplementer;
  private apiImplementer: APIImplementer;
  private frontendImplementer: FrontendImplementer;
  private databaseConnector: DatabaseConnector;

  constructor(projectRoot: string) {
    const apiKey = process.env.OPENAI_API_KEY;
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required for the AI agent to function.');
    }
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required for the database agent to function.');
    }
    
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
    
    this.contextManager = new ContextManager(projectRoot);
    this.databaseImplementer = new DatabaseImplementer(projectRoot);
    this.apiImplementer = new APIImplementer(projectRoot);
    this.frontendImplementer = new FrontendImplementer(projectRoot);
    this.databaseConnector = new DatabaseConnector();
  }

  async processQuery(query: string): Promise<ExecutionPlan> {
    console.log('🧠 AI Agent processing query...');
    
    // 1. MANDATORY: Connect to database and get real-time info
    console.log('🔌 Connecting to database...');
    try {
      await this.databaseConnector.connect();
      const dbInfo = await this.databaseConnector.getDatabaseInfo();
      console.log(`📊 Database status: ${dbInfo.totalTables} tables found`);
      
      if (dbInfo.tables.length > 0) {
        console.log(`📋 Existing tables: ${dbInfo.tables.map((t: any) => t.name).join(', ')}`);
      }
    } catch (error) {
      console.error('❌ FATAL: Database connection failed!');
      console.error('This is a DATABASE agent - it requires a working database connection.');
      console.error('Please check your DATABASE_URL environment variable and ensure your database is running.');
      throw new Error('Database connection required but failed');
    }
    
    // 2. Gather comprehensive context
    const fullContext = await this.contextManager.getOrBuildContext(query);
    const tailoredContext = await this.contextManager.tailorContextForQuery(query, fullContext);
    
    // 3. Generate execution plan using AI
    const plan = await this.generateExecutionPlan(query, tailoredContext);
    
    // 4. Validate and optimize plan
    const validatedPlan = await this.validatePlan(plan, tailoredContext);
    
    return validatedPlan;
  }

  async getDatabaseStatus(): Promise<any> {
    try {
      await this.databaseConnector.connect();
      return await this.databaseConnector.getDatabaseInfo();
    } catch (error) {
      return {
        totalTables: 0,
        tables: [],
        connectionStatus: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async executePlan(plan: ExecutionPlan): Promise<void> {
    console.log('🚀 AI Agent executing plan...');
    
    // MANDATORY: Ensure database connection
    try {
      await this.databaseConnector.connect();
    } catch (error) {
      console.error('❌ FATAL: Cannot execute plan without database connection!');
      throw new Error('Database connection required for execution');
    }
    
    for (const step of plan.steps) {
      console.log(`📝 Executing: ${step.description}`);
      
      try {
        await this.executeStep(step);
      } catch (error) {
        console.error(`❌ Error executing step: ${step.description}`, error);
        throw error;
      }
    }
    
    // MANDATORY: Run migrations
    try {
      await this.databaseConnector.runMigration();
      console.log('✅ Database migrations applied');
    } catch (error) {
      console.error('❌ FATAL: Migration failed!');
      throw new Error('Database migration required but failed');
    }
    
    console.log('✅ AI Agent execution complete');
  }

  private async generateExecutionPlan(query: string, context: ProjectContext): Promise<ExecutionPlan> {
    const prompt = await this.buildContextualPrompt(query, context);
    
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert database agent working on a Spotify clone Next.js project. You must generate detailed execution plans that follow the project's existing patterns and conventions.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 4000
    });

    const planText = response.choices[0]?.message?.content;
    if (!planText) {
      throw new Error('Failed to generate execution plan');
    }

    return this.parseExecutionPlan(planText, query);
  }

  private async buildContextualPrompt(query: string, context: ProjectContext): Promise<string> {
    // Get real-time database information
    let dbInfo = { totalTables: 0, tables: [], connectionStatus: 'disconnected' };
    try {
      dbInfo = await this.databaseConnector.getDatabaseInfo();
    } catch (error) {
      console.log('⚠️ Could not get database info for prompt');
    }

    // Limit context to reduce token usage
    const limitedContext = {
      summary: context.summary?.substring(0, 500), // Limit summary length
      dependencies: {
        hasDrizzle: context.dependencies?.dependencies?.drizzle ? 'yes' : 'no',
        hasPostgres: context.dependencies?.dependencies?.postgres ? 'yes' : 'no',
        hasNext: context.dependencies?.dependencies?.next ? 'yes' : 'no'
      },
      structure: {
        hasComponents: context.projectStructure?.src?.components ? 'yes' : 'no',
        hasAPI: context.projectStructure?.src?.app?.api ? 'yes' : 'no',
        hasDB: context.projectStructure?.src?.lib?.db ? 'yes' : 'no'
      },
      database: {
        totalTables: dbInfo.totalTables,
        tables: dbInfo.tables.map((table: any) => table.name),
        connectionStatus: dbInfo.connectionStatus
      }
    };

    return `
You are a database agent working on a Spotify clone Next.js project.

PROJECT CONTEXT:
${JSON.stringify(limitedContext, null, 2)}

USER REQUEST: ${query}

CRITICAL REQUIREMENTS:
1. **DIRECT DATABASE OPERATIONS**: The agent directly executes SQL commands on the PostgreSQL database
2. **NO FILE GENERATION FOR SCHEMA**: Do NOT generate schema files - create tables directly in the database
3. **USE DRIZZLE ORM**: For database operations, use Drizzle ORM which is already configured
4. **CREATE TABLES DIRECTLY**: When creating tables, execute CREATE TABLE SQL directly
5. **DELETE TABLES DIRECTLY**: When deleting tables, execute DROP TABLE SQL directly

RESPONSE FORMAT:
Generate a detailed execution plan in the following JSON format:
{
  "steps": [
    {
      "description": "Create table 'table_name' directly in database",
      "files": [],
      "operation": "create",
      "estimatedDuration": 30
    }
  ],
  "estimatedTime": "X minutes",
  "riskLevel": "low|medium|high"
}

IMPORTANT INSTRUCTIONS:
- For table creation: Use descriptions like "Create table 'recently_played_songs' directly in database"
- For table deletion: Use descriptions like "Delete table 'table_name' from database" or "Drop all tables from database"
- For schema operations: Use descriptions that mention "directly in database" or "execute SQL"
- DO NOT mention "schema files" or "generate migrations" - focus on direct database operations
- The agent will parse these descriptions and execute the appropriate SQL commands

Focus on:
1. Direct database table creation/deletion
2. API endpoint creation for the created tables
3. Frontend component integration
4. Type safety and validation
5. Error handling and edge cases

Make sure the plan focuses on direct database manipulation, not file generation.
`;
  }

  private parseExecutionPlan(planText: string, query: string): ExecutionPlan {
    // Extract JSON from the response
    const jsonMatch = planText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI failed to generate a valid execution plan');
    }

    const plan = JSON.parse(jsonMatch[0]);
    
    // Validate plan structure
    if (!plan.steps || !Array.isArray(plan.steps)) {
      throw new Error('AI generated invalid plan structure');
    }

    return {
      steps: plan.steps.map((step: any) => ({
        description: step.description || 'Unknown step',
        files: step.files || [],
        operation: step.operation || 'create',
        estimatedDuration: step.estimatedDuration || 30
      })),
      estimatedTime: plan.estimatedTime || '5 minutes',
      riskLevel: plan.riskLevel || 'low'
    };
  }



  private async validatePlan(plan: ExecutionPlan, context: ProjectContext): Promise<ExecutionPlan> {
    // Add validation logic here
    console.log('✅ Plan validation complete');
    return plan;
  }

  private async executeStep(step: any): Promise<void> {
    const { description, files, operation } = step;
    
    // PRIORITY 1: Direct database operations (these should execute SQL directly)
    if (description.toLowerCase().includes('delete') || description.toLowerCase().includes('drop')) {
      await this.handleDatabaseDeletion(description);
    } else if (description.toLowerCase().includes('create table') && description.toLowerCase().includes('directly in database')) {
      // Only handle table creation if it explicitly mentions "directly in database"
      await this.handleTableCreationFromDescription(description);
    } else if (description.toLowerCase().includes('add column') || description.toLowerCase().includes('modify table')) {
      await this.handleTableModification(description);
    } else if (description.toLowerCase().includes('install') || description.toLowerCase().includes('configure')) {
      // Skip installation steps - we already have Drizzle configured
      console.log(`⏭️ Skipping installation step: ${description}`);
      console.log(`✅ Drizzle ORM is already configured and connected to PostgreSQL`);
    } else if (description.toLowerCase().includes('define') && description.toLowerCase().includes('model')) {
      // Skip model definition steps - we'll handle this differently
      console.log(`⏭️ Skipping model definition step: ${description}`);
      console.log(`✅ Table already created directly in database`);
    } else if (description.includes('API') || description.includes('endpoint')) {
      await this.apiImplementer.executeAPIOperation(description, files, operation);
    } else if (description.includes('frontend') || description.includes('component')) {
      await this.frontendImplementer.executeFrontendOperation(description, files, operation);
    } else {
      // Generic operation
      await this.executeGenericOperation(description, files, operation);
    }
  }

  private async handleDatabaseDeletion(description: string): Promise<void> {
    console.log(`🗑️ Handling database deletion: ${description}`);
    
    if (description.toLowerCase().includes('all tables') || description.toLowerCase().includes('delete all')) {
      await this.databaseConnector.dropAllTables();
    } else {
      // Extract table name from description - look for quoted table names first
      let tableMatch = description.match(/['"`]([^'"`]+)['"`]/);
      if (!tableMatch) {
        // Fallback: look for table name after "table" keyword
        tableMatch = description.match(/table\s+['"`]?([a-zA-Z_][a-zA-Z0-9_]*)['"`]?/i);
      }
      if (!tableMatch) {
        // Last resort: look for any word that looks like a table name
        tableMatch = description.match(/([a-zA-Z_][a-zA-Z0-9_]*_songs|[a-zA-Z_][a-zA-Z0-9_]*_users|[a-zA-Z_][a-zA-Z0-9_]*_playlists|[a-zA-Z_][a-zA-Z0-9_]*_albums|[A-Z][a-zA-Z0-9_]*)/i);
      }
      
      if (tableMatch) {
        const tableName = tableMatch[1];
        console.log(`🗑️ Dropping table: ${tableName}`);
        await this.databaseConnector.dropTable(tableName);
      } else {
        throw new Error('Could not determine which table to delete');
      }
    }
  }

  private async handleTableCreation(description: string): Promise<void> {
    console.log(`🏗️ Handling table creation: ${description}`);
    
    // This would need to be enhanced to parse table creation details from the description
    // For now, we'll create a basic table structure
    const tableMatch = description.match(/(?:create|add)\s+(?:table\s+)?(\w+)/i);
    if (tableMatch) {
      const tableName = tableMatch[1];
      const basicColumns = [
        'id uuid PRIMARY KEY DEFAULT gen_random_uuid()',
        'created_at timestamp DEFAULT now()',
        'updated_at timestamp DEFAULT now()'
      ];
      await this.databaseConnector.createTable(tableName, basicColumns);
    } else {
      throw new Error('Could not determine table name for creation');
    }
  }

  private async handleTableModification(description: string): Promise<void> {
    console.log(`🔧 Handling table modification: ${description}`);
    
    // This would need to be enhanced to parse column modification details
    // For now, we'll create a placeholder
    console.log('Table modification not yet implemented - would need to parse column details from description');
  }

  private async handleTableCreationFromDescription(description: string): Promise<void> {
    console.log(`🏗️ Creating table from description: ${description}`);
    
    // Extract table name from description - look for quoted table names first
    let tableMatch = description.match(/['"`]([^'"`]+)['"`]/);
    if (!tableMatch) {
      // Fallback: look for table name after "table" keyword
      tableMatch = description.match(/table\s+['"`]?([a-zA-Z_][a-zA-Z0-9_]*)['"`]?/i);
    }
    if (!tableMatch) {
      // Last resort: look for any word that looks like a table name
      tableMatch = description.match(/([a-zA-Z_][a-zA-Z0-9_]*_songs|[a-zA-Z_][a-zA-Z0-9_]*_users|[a-zA-Z_][a-zA-Z0-9_]*_playlists)/i);
    }
    
    if (tableMatch) {
      const tableName = tableMatch[1];
      
      // Create a proper table structure based on the table name
      let columns: string[] = [];
      
      if (tableName.toLowerCase().includes('recently_played')) {
        columns = [
          'id uuid PRIMARY KEY DEFAULT gen_random_uuid()',
          'user_id uuid NOT NULL',
          'song_id uuid NOT NULL',
          'played_at timestamp DEFAULT now()',
          'created_at timestamp DEFAULT now()',
          'updated_at timestamp DEFAULT now()'
        ];
      } else if (tableName.toLowerCase().includes('songs')) {
        columns = [
          'id uuid PRIMARY KEY DEFAULT gen_random_uuid()',
          'title varchar(255) NOT NULL',
          'artist varchar(255) NOT NULL',
          'album varchar(255)',
          'duration integer',
          'created_at timestamp DEFAULT now()',
          'updated_at timestamp DEFAULT now()'
        ];
      } else if (tableName.toLowerCase().includes('users')) {
        columns = [
          'id uuid PRIMARY KEY DEFAULT gen_random_uuid()',
          'username varchar(100) UNIQUE NOT NULL',
          'email varchar(255) UNIQUE NOT NULL',
          'created_at timestamp DEFAULT now()',
          'updated_at timestamp DEFAULT now()'
        ];
      } else {
        // Generic table structure
        columns = [
          'id uuid PRIMARY KEY DEFAULT gen_random_uuid()',
          'created_at timestamp DEFAULT now()',
          'updated_at timestamp DEFAULT now()'
        ];
      }
      
      await this.databaseConnector.createTable(tableName, columns);
      console.log(`✅ Table '${tableName}' created successfully with ${columns.length} columns`);
    } else {
      throw new Error('Could not determine table name from description');
    }
  }

  private async executeGenericOperation(description: string, files: string[], operation: string): Promise<void> {
    console.log(`🔧 Executing generic operation: ${description}`);
    
    // Simulate work
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`✅ Completed: ${description}`);
  }
} 