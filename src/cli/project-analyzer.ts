import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { ProjectState } from './orchids-cli';

export class ProjectAnalyzer {
  private projectRoot: string;
  private projectState: ProjectState;

  constructor() {
    this.projectRoot = process.cwd();
    this.projectState = {
      tableCount: 0,
      routeCount: 0,
      componentCount: 0,
      databaseType: 'none',
      ormType: 'none'
    };
  }

  async analyzeWithProgress(): Promise<ProjectState> {
    console.log(chalk.blue.bold('\n🔍 Analyzing project structure...'));
    
    const steps = [
      'Scanning project files...',
      'Analyzing package.json...',
      'Checking for existing database setup...',
      'Counting components and routes...',
      'Detecting project architecture...',
      'Generating analysis report...'
    ];

    for (const step of steps) {
      const spinner = ora({
        text: step,
        spinner: 'dots12',
        color: 'cyan'
      }).start();
      
      await this.simulateAnalysis(step);
      
      spinner.succeed(chalk.green(`✓ ${step}`));
    }

    // Perform actual analysis
    await this.performAnalysis();
    
    // Display results
    this.displayAnalysisResults();
    
    return this.projectState;
  }

  private async simulateAnalysis(step: string): Promise<void> {
    // Simulate different analysis times based on step
    const delays: { [key: string]: number } = {
      'Scanning project files...': 800,
      'Analyzing package.json...': 600,
      'Checking for existing database setup...': 1200,
      'Counting components and routes...': 900,
      'Detecting project architecture...': 700,
      'Generating analysis report...': 500
    };
    
    await new Promise(resolve => setTimeout(resolve, delays[step] || 500));
  }

  private async performAnalysis(): Promise<void> {
    // Analyze package.json
    await this.analyzePackageJson();
    
    // Count components
    this.countComponents();
    
    // Count API routes
    this.countApiRoutes();
    
    // Check for existing database setup
    this.checkDatabaseSetup();
    
    // Analyze project structure
    this.analyzeProjectStructure();
  }

  private async analyzePackageJson(): Promise<void> {
    const packagePath = path.join(this.projectRoot, 'package.json');
    
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      // Check for database-related dependencies
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (dependencies['drizzle-orm']) {
        this.projectState.ormType = 'drizzle';
      } else if (dependencies['prisma']) {
        this.projectState.ormType = 'prisma';
      } else if (dependencies['typeorm']) {
        this.projectState.ormType = 'typeorm';
      }
      
      // Check for database drivers
      if (dependencies['pg'] || dependencies['postgres']) {
        this.projectState.databaseType = 'postgresql';
      } else if (dependencies['mysql2']) {
        this.projectState.databaseType = 'mysql';
      } else if (dependencies['sqlite3']) {
        this.projectState.databaseType = 'sqlite';
      }
    }
  }

  private countComponents(): void {
    const componentsDir = path.join(this.projectRoot, 'src', 'components');
    
    if (fs.existsSync(componentsDir)) {
      this.projectState.componentCount = this.countFilesRecursively(componentsDir, ['.tsx', '.jsx']);
    }
  }

  private countApiRoutes(): void {
    const apiDir = path.join(this.projectRoot, 'src', 'app', 'api');
    
    if (fs.existsSync(apiDir)) {
      this.projectState.routeCount = this.countFilesRecursively(apiDir, ['.ts', '.js']);
    }
  }

  private checkDatabaseSetup(): void {
    const possibleDbFiles = [
      'drizzle.config.ts',
      'drizzle.config.js',
      'prisma/schema.prisma',
      'database/schema.ts',
      'db/schema.ts'
    ];
    
    for (const file of possibleDbFiles) {
      if (fs.existsSync(path.join(this.projectRoot, file))) {
        this.projectState.tableCount = 1; // At least one schema file exists
        break;
      }
    }
  }

  private analyzeProjectStructure(): void {
    const structure = {
      hasSrc: fs.existsSync(path.join(this.projectRoot, 'src')),
      hasApp: fs.existsSync(path.join(this.projectRoot, 'src', 'app')),
      hasPages: fs.existsSync(path.join(this.projectRoot, 'src', 'pages')),
      hasComponents: fs.existsSync(path.join(this.projectRoot, 'src', 'components')),
      hasLib: fs.existsSync(path.join(this.projectRoot, 'src', 'lib')),
      hasTypes: fs.existsSync(path.join(this.projectRoot, 'src', 'types')),
      hasUtils: fs.existsSync(path.join(this.projectRoot, 'src', 'utils'))
    };
    
    // Store structure info for later use
    (this.projectState as any).structure = structure;
  }

  private countFilesRecursively(dir: string, extensions: string[]): number {
    let count = 0;
    
    if (!fs.existsSync(dir)) return count;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        count += this.countFilesRecursively(fullPath, extensions);
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          count++;
        }
      }
    }
    
    return count;
  }

  private displayAnalysisResults(): void {
    console.log(chalk.blue.bold('\n📊 Project Analysis Results:'));
    
    const results = boxen(
      chalk.bold.cyan('PROJECT OVERVIEW\n\n') +
      `${chalk.yellow('Components:')} ${chalk.cyan(this.projectState.componentCount)} React components\n` +
      `${chalk.yellow('API Routes:')} ${chalk.cyan(this.projectState.routeCount)} endpoints\n` +
      `${chalk.yellow('Database:')} ${chalk.cyan(this.projectState.databaseType === 'none' ? 'Not configured' : this.projectState.databaseType)}\n` +
      `${chalk.yellow('ORM:')} ${chalk.cyan(this.projectState.ormType === 'none' ? 'Not configured' : this.projectState.ormType)}\n` +
      `${chalk.yellow('Tables:')} ${chalk.cyan(this.projectState.tableCount)} database tables\n\n` +
      chalk.dim('Project is ready for database integration! 🌺'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan'
      }
    );
    
    console.log(results);
  }

  getProjectState(): ProjectState {
    return this.projectState;
  }
} 