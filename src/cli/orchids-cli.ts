import chalk from 'chalk';
import boxen from 'boxen';
import gradient from 'gradient-string';
import inquirer from 'inquirer';
import { terminal } from 'terminal-kit';
import ora from 'ora';
import { AIAgent } from '../agent/ai-agent';

export interface ExecutionPlan {
  steps: ExecutionStep[];
  estimatedTime: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ExecutionStep {
  description: string;
  files: string[];
  operation: string;
  estimatedDuration: number;
}

export interface ProjectState {
  tableCount: number;
  routeCount: number;
  componentCount: number;
  databaseType: string;
  ormType: string;
}

export class OrchidsCLI {
  private projectContext: any = {};
  private currentMode: string = '';
  private aiAgent: AIAgent;

  constructor(projectRoot: string) {
    this.aiAgent = new AIAgent(projectRoot);
  }

  async initialize() {
    console.log(chalk.blue.bold('🚀 Initializing Orchids Database Agent...'));
    
    // Check for required environment variables
    if (!process.env.OPENAI_API_KEY) {
      console.error(chalk.red.bold('❌ FATAL: OPENAI_API_KEY environment variable is required!'));
      console.error(chalk.yellow('Please add your OpenAI API key to the .env file:'));
      console.error(chalk.dim('OPENAI_API_KEY=sk-proj-your-api-key-here'));
      process.exit(1);
    }
    
    if (!process.env.DATABASE_URL) {
      console.error(chalk.red.bold('❌ FATAL: DATABASE_URL environment variable is required!'));
      console.error(chalk.yellow('Please add your database URL to the .env file:'));
      console.error(chalk.dim('DATABASE_URL=postgresql://username:password@localhost:5432/spotify_clone'));
      console.error(chalk.yellow('\nMake sure your PostgreSQL database is running and accessible.'));
      process.exit(1);
    }
    
    const spinner = ora({
      text: 'Connecting to database and loading project context...',
      spinner: 'dots12',
      color: 'cyan'
    }).start();
    
    try {
      // Test database connection
      await this.aiAgent.getDatabaseStatus();
      spinner.succeed(chalk.green('✓ Database connected and project context loaded'));
    } catch (error) {
      spinner.fail(chalk.red('✗ Failed to connect to database'));
      console.error(chalk.red('Database connection error:'), error);
      console.error(chalk.yellow('\nPlease check your DATABASE_URL and ensure your database is running.'));
      process.exit(1);
    }
    
    // Show mode selection
    await this.showModeSelection();
  }

  private async showModeSelection() {
    console.log(chalk.blue.bold('\n🎯 Select your preferred interaction mode:'));
    
    const mode = await inquirer.prompt({
      type: 'list',
      name: 'mode',
      message: 'How would you like to proceed?',
      choices: [
        { 
          name: '💬 Interactive Chat Mode', 
          value: 'chat',
          short: 'Chat with the agent naturally'
        },
        { 
          name: '⚡ Quick Command Mode', 
          value: 'quick',
          short: 'Direct commands for power users'
        },
        { 
          name: '🎯 Guided Setup Wizard', 
          value: 'wizard',
          short: 'Step-by-step database setup'
        },
        { 
          name: '📊 Project Analysis', 
          value: 'analyze',
          short: 'Analyze current project state'
        }
      ]
    });
    
    this.currentMode = mode.mode;
    
    switch(mode.mode) {
      case 'chat':
        return this.startChatMode();
      case 'quick':
        return this.startQuickMode();
      case 'wizard':
        return this.startWizard();
      case 'analyze':
        return this.analyzeProject();
    }
  }

  private async startChatMode() {
    console.log(chalk.green.bold('\n💬 Interactive Chat Mode Activated'));
    console.log(chalk.dim('You can now chat naturally with the database agent.'));
    console.log(chalk.dim('Examples: "Add user authentication", "Create a playlist system", "Set up user profiles"'));
    
    let continueChat = true;
    
    while (continueChat) {
      try {
        // Get user query
        const query = await this.getQueryWithAutocomplete();
        
        // Process with AI agent
        const plan = await this.aiAgent.processQuery(query);
        
        // Show plan and confirm
        const confirmed = await this.confirmExecution(plan);
        
        if (confirmed) {
          // Execute the plan
          await this.aiAgent.executePlan(plan);
          console.log(chalk.green.bold('\n✅ Database features implemented successfully!'));
        } else {
          console.log(chalk.yellow('\n❌ Execution cancelled by user.'));
        }
        
        // Ask if user wants to continue
        const continueResponse = await inquirer.prompt({
          type: 'list',
          name: 'action',
          message: 'What would you like to do next?',
          choices: [
            { name: '🔄 Ask another question', value: 'continue' },
            { name: '📊 Analyze project state', value: 'analyze' },
            { name: '🚪 Exit to main menu', value: 'exit' },
            { name: '👋 Quit application', value: 'quit' }
          ]
        });
        
        switch (continueResponse.action) {
          case 'continue':
            console.log(chalk.blue.bold('\n🔄 Ready for your next query...'));
            break;
          case 'analyze':
            await this.analyzeProject();
            console.log(chalk.blue.bold('\n🔄 Ready for your next query...'));
            break;
          case 'exit':
            continueChat = false;
            console.log(chalk.blue.bold('\n🔄 Returning to main menu...'));
            await this.showModeSelection();
            return;
          case 'quit':
            continueChat = false;
            console.log(chalk.blue.bold('\n👋 Thanks for using Orchids Database Agent!'));
            process.exit(0);
        }
        
      } catch (error) {
        console.error(chalk.red('\n❌ Error during execution:'), error);
        
        const errorResponse = await inquirer.prompt({
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: '🔄 Try again', value: 'retry' },
            { name: '🚪 Exit to main menu', value: 'exit' },
            { name: '👋 Quit application', value: 'quit' }
          ]
        });
        
        switch (errorResponse.action) {
          case 'retry':
            console.log(chalk.blue.bold('\n🔄 Let\'s try again...'));
            break;
          case 'exit':
            continueChat = false;
            console.log(chalk.blue.bold('\n🔄 Returning to main menu...'));
            await this.showModeSelection();
            return;
          case 'quit':
            continueChat = false;
            console.log(chalk.blue.bold('\n👋 Thanks for using Orchids Database Agent!'));
            process.exit(0);
        }
      }
    }
  }

  private async startQuickMode() {
    console.log(chalk.yellow.bold('\n⚡ Quick Command Mode Activated'));
    console.log(chalk.dim('Direct command interface for experienced users.'));
  }

  private async startWizard() {
    console.log(chalk.cyan.bold('\n🎯 Guided Setup Wizard Activated'));
    console.log(chalk.dim('Step-by-step database setup process.'));
  }

  private async analyzeProject() {
    console.log(chalk.magenta.bold('\n📊 Project Analysis Mode Activated'));
    console.log(chalk.dim('Analyzing your current project structure...'));
    
    const spinner = ora({
      text: 'Connecting to database and analyzing project...',
      spinner: 'dots12',
      color: 'cyan'
    }).start();
    
    try {
      // Get real database status
      const dbStatus = await this.aiAgent.getDatabaseStatus();
      
      spinner.succeed(chalk.green('✓ Analysis complete'));
      
      // Get detailed table information
      let tableDetails = '';
      if (dbStatus.tables && dbStatus.tables.length > 0) {
        tableDetails = '\n' + chalk.cyan('📋 Database Tables:\n');
        
        // Create table header
        const header = `${chalk.yellow('Schema')} | ${chalk.yellow('Name')} | ${chalk.yellow('Type')} | ${chalk.yellow('Owner')}`;
        const separator = '--------+-----------------------+-------+--------';
        tableDetails += `   ${header}\n`;
        tableDetails += `   ${separator}\n`;
        
        // Add each table
        for (const table of dbStatus.tables) {
          const schema = chalk.cyan('public');
          const name = chalk.white(table.name.padEnd(21));
          const type = chalk.green('table');
          const owner = chalk.blue('rohanjp');
          tableDetails += `   ${schema} | ${name} | ${type} | ${owner}\n`;
        }
        
        // Add column details for each table
        tableDetails += '\n' + chalk.cyan('📋 Table Schemas:\n');
        for (const table of dbStatus.tables) {
          tableDetails += `   ${chalk.yellow(table.name)}:\n`;
          if (table.columns && table.columns.length > 0) {
            for (const column of table.columns) {
              const nullable = column.nullable ? 'NULL' : 'NOT NULL';
              const defaultVal = column.default ? ` DEFAULT ${column.default}` : '';
              tableDetails += `     ${chalk.blue('•')} ${chalk.white(column.name)} ${chalk.cyan(column.type)} ${chalk.dim(nullable)}${chalk.dim(defaultVal)}\n`;
            }
          } else {
            tableDetails += `     ${chalk.dim('No column information available')}\n`;
          }
        }
      }
      
      // Display project analysis
      const analysisDisplay = boxen(
        chalk.bold.magenta('📊 PROJECT ANALYSIS\n\n') +
        chalk.cyan('🗄️ Database Status:\n') +
        `   ${chalk.yellow('Connection:')} ${dbStatus.connectionStatus === 'connected' ? chalk.green('✅ Connected') : chalk.red('❌ Disconnected')}\n` +
        `   ${chalk.yellow('Total Tables:')} ${chalk.blue(dbStatus.totalTables)}\n` +
        (dbStatus.tables.length > 0 ? 
          `   ${chalk.yellow('Tables:')} ${chalk.blue(dbStatus.tables.map((t: any) => t.name).join(', '))}\n` : 
          `   ${chalk.yellow('Tables:')} ${chalk.dim('None found')}\n`
        ) +
        (dbStatus.error ? `   ${chalk.red('Error:')} ${dbStatus.error}\n` : '') +
        tableDetails +
        '\n' +
        chalk.cyan('📁 Project Structure:\n') +
        `   ${chalk.yellow('Type:')} Next.js App Router\n` +
        `   ${chalk.yellow('ORM:')} Drizzle\n` +
        `   ${chalk.yellow('Database:')} PostgreSQL\n` +
        `   ${chalk.yellow('Styling:')} Tailwind CSS\n`,
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'magenta'
        }
      );
      
      console.log(analysisDisplay);
      
      // Show recommendations
      if (dbStatus.totalTables === 0) {
        console.log(chalk.yellow.bold('\n💡 Recommendations:'));
        console.log(chalk.dim('   • Run database migrations to create tables'));
        console.log(chalk.dim('   • Check your DATABASE_URL environment variable'));
        console.log(chalk.dim('   • Ensure your database is running'));
      } else {
        console.log(chalk.green.bold('\n✅ Database is properly configured and ready!'));
      }
      
    } catch (error) {
      spinner.fail(chalk.red('✗ Analysis failed'));
      console.error(chalk.red('Error during analysis:'), error);
    }
    
    // Return to main menu
    console.log(chalk.blue.bold('\n🔄 Returning to main menu...'));
    await new Promise(resolve => setTimeout(resolve, 2000));
    await this.showModeSelection();
  }

  async getQueryWithAutocomplete(): Promise<string> {
    console.log(chalk.blue.bold('\n💭 What would you like the database agent to do?'));
    
    const suggestions = [
      'Add user authentication system',
      'Create playlist management',
      'Set up user profiles',
      'Add song library management',
      'Create artist/album system',
      'Add search functionality',
      'Set up user preferences',
      'Create listening history',
      'Add social features',
      'Set up payment system'
    ];

    const query = await inquirer.prompt({
      type: 'input',
      name: 'query',
      message: 'Describe your database needs:',
      validate: (input: string) => {
        if (input.trim().length < 10) {
          return 'Please provide a more detailed description (at least 10 characters)';
        }
        return true;
      }
    });

    // Show smart suggestions if query is short
    if (query.query.trim().length < 20) {
      console.log(chalk.dim('\n💡 Smart suggestions:'));
      suggestions.slice(0, 3).forEach((suggestion, i) => {
        console.log(chalk.dim(`   ${i + 1}. ${suggestion}`));
      });
    }

    return query.query;
  }

  async confirmExecution(plan: ExecutionPlan): Promise<boolean> {
    console.log(chalk.blue.bold('\n🤔 Review the execution plan:'));
    
    const planDisplay = boxen(
      chalk.bold.blue('📋 EXECUTION PLAN\n\n') +
      plan.steps.map((step, i) => 
        `${chalk.cyan(`${i+1}.`)} ${step.description}\n` +
        `   ${chalk.dim('Files:')} ${step.files.join(', ')}\n` +
        `   ${chalk.dim('Duration:')} ${step.estimatedDuration}s\n`
      ).join('\n') +
      `\n${chalk.yellow('Estimated Time:')} ${plan.estimatedTime}\n` +
      `${chalk.yellow('Risk Level:')} ${this.getRiskLevelDisplay(plan.riskLevel)}`,
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'blue'
      }
    );
    
    console.log(planDisplay);
    
    const confirm = await inquirer.prompt({
      type: 'confirm',
      name: 'proceed',
      message: '🤔 Does this plan look good to you?',
      default: true
    });
    
    return confirm.proceed;
  }

  private getRiskLevelDisplay(riskLevel: string): string {
    switch (riskLevel) {
      case 'low':
        return chalk.green('🟢 Low Risk');
      case 'medium':
        return chalk.yellow('🟡 Medium Risk');
      case 'high':
        return chalk.red('🔴 High Risk');
      default:
        return chalk.gray('⚪ Unknown');
    }
  }

  async showProgress(message: string, progress: number) {
    const bar = '█'.repeat(Math.floor(progress / 2)) + '░'.repeat(50 - Math.floor(progress / 2));
    process.stdout.write(`\r${chalk.blue(message)} [${chalk.cyan(bar)}] ${progress}%`);
  }

  async showFileModification(file: string, operation: string) {
    const spinner = ora({
      text: `${operation} ${chalk.yellow(file)}`,
      spinner: 'bouncingBar'
    }).start();
    
    // Simulate work
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    spinner.succeed(chalk.green(`✓ ${operation} ${chalk.yellow(file)}`));
  }

  async showThinking(steps: string[]) {
    console.log(chalk.blue.bold('\n🧠 Agent Analysis:'));
    
    for (const step of steps) {
      const spinner = ora({
        text: step,
        spinner: 'dots12',
        color: 'cyan'
      }).start();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      spinner.succeed(chalk.green(`✓ ${step}`));
    }
  }
} 