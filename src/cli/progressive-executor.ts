import chalk from 'chalk';
import boxen from 'boxen';
import cliProgress from 'cli-progress';
import ora from 'ora';
import { terminal } from 'terminal-kit';
import { ExecutionPlan } from '../agent/types';
import { AIAgent } from '../agent/ai-agent';

export class ProgressiveExecutor {
  private multibar: cliProgress.MultiBar;
  private bars: { [key: string]: any } = {};
  private aiAgent: AIAgent;

  constructor(projectRoot: string) {
    this.multibar = new cliProgress.MultiBar({
      clearOnComplete: false,
      hideCursor: true,
      format: ' {bar} | {filename} | {percentage}% | {value}/{total} | {stage}',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
    });
    this.aiAgent = new AIAgent(projectRoot);
  }

  async executeWithDashboard(plan: ExecutionPlan, query: string): Promise<void> {
    console.log(chalk.blue.bold('\n🚀 Starting AI-powered execution with live dashboard...'));
    
    // Initialize progress bars for each stage
    this.initializeProgressBars(plan);
    
    try {
      // Use AI agent to execute the plan
      await this.aiAgent.executePlan(plan);
      
      // Update progress bars to completion
      this.updateAllProgressBars(100);
      
      // Stop progress bars
      this.multibar.stop();
      
      // Show completion summary
      this.showCompletionSummary(plan);
      
    } catch (error) {
      this.multibar.stop();
      console.error(chalk.red.bold('\n❌ Execution failed:'), error);
      throw error;
    }
  }

  private initializeProgressBars(plan: ExecutionPlan): void {
    // Create progress bars for each stage
    this.bars.analysis = this.multibar.create(100, 0, { 
      stage: 'Analysis', 
      filename: 'Project' 
    });
    this.bars.schema = this.multibar.create(100, 0, { 
      stage: 'Schema', 
      filename: 'Database' 
    });
    this.bars.api = this.multibar.create(100, 0, { 
      stage: 'API Routes', 
      filename: 'Backend' 
    });
    this.bars.frontend = this.multibar.create(100, 0, { 
      stage: 'Frontend', 
      filename: 'Components' 
    });
    this.bars.integration = this.multibar.create(100, 0, { 
      stage: 'Integration', 
      filename: 'Testing' 
    });
  }

  private async executeStep(step: any, stepNumber: number, totalSteps: number): Promise<void> {
    console.log(chalk.blue.bold(`\n📝 Step ${stepNumber}/${totalSteps}: ${step.description}`));
    
    const spinner = ora({
      text: `Executing: ${step.operation}`,
      spinner: 'dots12',
      color: 'cyan'
    }).start();
    
    // Simulate work based on step type
    await this.simulateStepExecution(step);
    
    spinner.succeed(chalk.green(`✓ Completed: ${step.operation}`));
    
    // Update progress bars based on step type
    this.updateProgressBars(step);
    
    // Show file modifications
    await this.showFileModifications(step.files, step.operation);
  }

  private async simulateStepExecution(step: any): Promise<void> {
    const baseDelay = step.estimatedDuration * 10; // Convert to milliseconds
    
    // Simulate different types of work
    if (step.description.includes('schema') || step.description.includes('Schema')) {
      await this.simulateSchemaWork(baseDelay);
    } else if (step.description.includes('API') || step.description.includes('endpoints')) {
      await this.simulateApiWork(baseDelay);
    } else if (step.description.includes('frontend') || step.description.includes('components')) {
      await this.simulateFrontendWork(baseDelay);
    } else if (step.description.includes('migration')) {
      await this.simulateMigrationWork(baseDelay);
    } else {
      await this.simulateGenericWork(baseDelay);
    }
  }

  private async simulateSchemaWork(delay: number): Promise<void> {
    const steps = [
      'Analyzing existing schema...',
      'Creating table definitions...',
      'Setting up relationships...',
      'Validating schema structure...',
      'Generating TypeScript types...'
    ];
    
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, delay / steps.length));
    }
  }

  private async simulateApiWork(delay: number): Promise<void> {
    const steps = [
      'Creating route handlers...',
      'Setting up middleware...',
      'Implementing CRUD operations...',
      'Adding error handling...',
      'Testing API endpoints...'
    ];
    
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, delay / steps.length));
    }
  }

  private async simulateFrontendWork(delay: number): Promise<void> {
    const steps = [
      'Creating React components...',
      'Setting up state management...',
      'Implementing UI interactions...',
      'Adding styling and animations...',
      'Testing component integration...'
    ];
    
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, delay / steps.length));
    }
  }

  private async simulateMigrationWork(delay: number): Promise<void> {
    const steps = [
      'Analyzing current database...',
      'Generating migration files...',
      'Validating migration scripts...',
      'Preparing rollback plans...',
      'Testing migration process...'
    ];
    
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, delay / steps.length));
    }
  }

  private async simulateGenericWork(delay: number): Promise<void> {
    const steps = [
      'Processing requirements...',
      'Generating code...',
      'Validating implementation...',
      'Testing functionality...',
      'Finalizing changes...'
    ];
    
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, delay / steps.length));
    }
  }

  private updateProgressBars(step: any): void {
    // Update relevant progress bars based on step type
    if (step.description.includes('schema') || step.description.includes('Schema')) {
      this.bars.schema.increment(20);
    } else if (step.description.includes('API') || step.description.includes('endpoints')) {
      this.bars.api.increment(20);
    } else if (step.description.includes('frontend') || step.description.includes('components')) {
      this.bars.frontend.increment(20);
    } else if (step.description.includes('migration')) {
      this.bars.schema.increment(10);
    } else {
      this.bars.integration.increment(20);
    }
    
    // Always update analysis bar
    this.bars.analysis.increment(20);
  }

  private updateAllProgressBars(value: number): void {
    // Update all progress bars to the specified value
    Object.values(this.bars).forEach((bar: any) => {
      bar.update(value);
    });
  }

  private async showFileModifications(files: string[], operation: string): Promise<void> {
    console.log(chalk.blue.bold('\n📁 File Modifications:'));
    
    for (const file of files) {
      const fileSpinner = ora({
        text: `${operation} ${chalk.yellow(file)}`,
        spinner: 'bouncingBar'
      }).start();
      
      // Simulate file operation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      fileSpinner.succeed(chalk.green(`✓ ${operation} ${chalk.yellow(file)}`));
    }
  }

  private showCompletionSummary(plan: ExecutionPlan): void {
    console.log(chalk.green.bold('\n🎉 Execution Completed Successfully!'));
    
    const summary = boxen(
      chalk.bold.green('✅ EXECUTION SUMMARY\n\n') +
      `${chalk.yellow('Steps Completed:')} ${chalk.cyan(plan.steps.length)}/${chalk.cyan(plan.steps.length)}\n` +
      `${chalk.yellow('Total Time:')} ${chalk.cyan(plan.estimatedTime)}\n` +
      `${chalk.yellow('Risk Level:')} ${this.getRiskLevelDisplay(plan.riskLevel)}\n` +
      `${chalk.yellow('Status:')} ${chalk.green('All operations successful')}\n\n` +
      chalk.dim('Your database features are now ready! 🌺'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'green'
      }
    );
    
    console.log(summary);
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

  async showRealTimeDashboard(projectState: any): Promise<void> {
    // Clear terminal for dashboard
    terminal.clear();
    
    // Header
    terminal.moveTo(1, 1);
    terminal.blue.bold('ORCHIDS DATABASE AGENT - LIVE DASHBOARD');
    terminal.moveTo(1, 2);
    terminal.dim('═'.repeat(80));
    
    // Stats Panel
    this.drawStatsPanel(projectState, 1, 4);
    
    // Files Panel  
    this.drawFilesPanel(projectState, 1, 12);
    
    // Recent Activity
    this.drawActivityPanel(projectState, 40, 4);
    
    // Agent Status
    this.drawAgentStatus(projectState, 40, 20);
    
    terminal.moveTo(1, 25);
  }

  private drawStatsPanel(state: any, x: number, y: number): void {
    terminal.moveTo(x, y);
    terminal.green.bold('📊 PROJECT STATS');
    terminal.moveTo(x, y + 1);
    terminal(`Tables: ${chalk.cyan(state.tableCount || 0)}`);
    terminal.moveTo(x, y + 2);
    terminal(`API Routes: ${chalk.cyan(state.routeCount || 0)}`);
    terminal.moveTo(x, y + 3);
    terminal(`Components: ${chalk.cyan(state.componentCount || 0)}`);
    terminal.moveTo(x, y + 4);
    terminal(`Database: ${chalk.cyan(state.databaseType || 'None')}`);
    terminal.moveTo(x, y + 5);
    terminal(`ORM: ${chalk.cyan(state.ormType || 'None')}`);
  }

  private drawFilesPanel(state: any, x: number, y: number): void {
    terminal.moveTo(x, y);
    terminal.blue.bold('📁 RECENT FILES');
    terminal.moveTo(x, y + 1);
    terminal.dim('No files modified yet...');
  }

  private drawActivityPanel(state: any, x: number, y: number): void {
    terminal.moveTo(x, y);
    terminal.yellow.bold('🔄 RECENT ACTIVITY');
    terminal.moveTo(x, y + 1);
    terminal.dim('Initializing...');
  }

  private drawAgentStatus(state: any, x: number, y: number): void {
    terminal.moveTo(x, y);
    terminal.cyan.bold('🤖 AGENT STATUS');
    terminal.moveTo(x, y + 1);
    terminal.green('Ready');
    terminal.moveTo(x, y + 2);
    terminal.dim('Waiting for commands...');
  }
} 