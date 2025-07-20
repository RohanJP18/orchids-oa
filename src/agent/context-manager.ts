import fs from 'fs';
import path from 'path';
import { ProjectContext } from './types';

export class ContextManager {
  private projectRoot: string;
  private cache = new Map<string, ProjectContext>();

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  async analyzeProject(): Promise<ProjectContext> {
    console.log('🔍 Starting focused project analysis...');
    
    // Focused analysis to reduce token usage
    const dependencies = await this.mapDependencies();
    const structure = await this.analyzeFileStructure();
    
    const context = this.synthesizeContext([dependencies, structure]);
    
    console.log('✅ Project analysis complete');
    return context;
  }

  async getOrBuildContext(query: string): Promise<ProjectContext> {
    const cacheKey = await this.generateCacheKey();
    
    if (this.cache.has(cacheKey)) {
      console.log('📋 Using cached project context');
      return this.cache.get(cacheKey)!;
    }
    
    console.log('🏗️ Building fresh project context...');
    const context = await this.analyzeProject();
    this.cache.set(cacheKey, context);
    return context;
  }

  async tailorContextForQuery(query: string, fullContext: ProjectContext): Promise<ProjectContext> {
    const queryType = this.classifyQuery(query);
    
    console.log(`🎯 Tailoring context for ${queryType} query...`);
    
    switch(queryType) {
      case 'database':
        return {
          ...fullContext,
          emphasis: ['dataModels', 'apiRoutes', 'databaseConfig'],
          include: await this.extractDatabaseRelatedFiles(),
          exclude: ['styling', 'animations', 'assets']
        };
      case 'frontend':
        return {
          ...fullContext,
          emphasis: ['components', 'hooks', 'stateManagement'],
          include: await this.extractUIRelatedFiles(),
          exclude: ['serverConfig', 'migrations']
        };
      case 'api':
        return {
          ...fullContext,
          emphasis: ['apiRoutes', 'dataModels', 'middleware'],
          include: await this.extractAPIRelatedFiles(),
          exclude: ['styling', 'animations']
        };
      default:
        return fullContext;
    }
  }

  private async analyzeFileStructure(): Promise<any> {
    const structure = {
      src: await this.scanDirectory('src'),
      public: await this.scanDirectory('public'),
      root: await this.scanDirectory('.', ['node_modules', '.next', '.git'])
    };
    
    return {
      type: 'structure',
      data: structure,
      summary: this.summarizeStructure(structure)
    };
  }

  private async identifyCodePatterns(): Promise<any> {
    const patterns = {
      components: await this.analyzeComponentPatterns(),
      apiRoutes: await this.analyzeAPIPatterns(),
      styling: await this.analyzeStylingPatterns(),
      stateManagement: await this.analyzeStateManagement(),
      dataFetching: await this.analyzeDataFetchingPatterns()
    };
    
    return {
      type: 'patterns',
      data: patterns,
      summary: this.summarizePatterns(patterns)
    };
  }

  private async mapDependencies(): Promise<any> {
    const packageJson = JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8'));
    
    return {
      type: 'dependencies',
      data: {
        dependencies: packageJson.dependencies || {},
        devDependencies: packageJson.devDependencies || {},
        scripts: packageJson.scripts || {}
      },
      summary: this.summarizeDependencies(packageJson)
    };
  }

  private async findIntegrationPoints(): Promise<any> {
    const integrationPoints = {
      database: await this.findDatabaseIntegrationPoints(),
      api: await this.findAPIIntegrationPoints(),
      ui: await this.findUIIntegrationPoints(),
      state: await this.findStateIntegrationPoints()
    };
    
    return {
      type: 'integrations',
      data: integrationPoints,
      summary: this.summarizeIntegrations(integrationPoints)
    };
  }

  private async scanDirectory(dirPath: string, exclude: string[] = []): Promise<any> {
    const fullPath = path.join(this.projectRoot, dirPath);
    if (!fs.existsSync(fullPath)) return null;
    
    const items = fs.readdirSync(fullPath);
    const structure: any = {};
    
    for (const item of items) {
      if (exclude.includes(item)) continue;
      
      const itemPath = path.join(fullPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // Only scan one level deep to reduce token usage
        const children = fs.readdirSync(itemPath).filter(child => !exclude.includes(child));
        structure[item] = {
          type: 'directory',
          children: children.slice(0, 10) // Limit to 10 items
        };
      } else {
        structure[item] = {
          type: 'file',
          size: stat.size
        };
      }
    }
    
    return structure;
  }

  private async analyzeComponentPatterns(): Promise<any> {
    const componentsDir = path.join(this.projectRoot, 'src', 'components');
    if (!fs.existsSync(componentsDir)) return {};
    
    const components = await this.findFiles('src/components', ['.tsx', '.jsx']);
    
    return {
      count: components.length,
      structure: 'functional-components',
      naming: 'PascalCase',
      styling: 'tailwind-css',
      patterns: ['typescript', 'react-hooks']
    };
  }

  private async analyzeAPIPatterns(): Promise<any> {
    const apiDir = path.join(this.projectRoot, 'src', 'app', 'api');
    if (!fs.existsSync(apiDir)) return {};
    
    const apiFiles = await this.findFiles('src/app/api', ['.ts', '.js']);
    
    return {
      count: apiFiles.length,
      structure: 'app-router',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      patterns: ['route-handlers', 'json-responses']
    };
  }

  private async analyzeStylingPatterns(): Promise<any> {
    const styleFiles = await this.findFiles('src', ['.css', '.scss', '.module.css']);
    
    return {
      approach: 'tailwind-css',
      frameworks: ['tailwindcss'],
      conventions: 'utility-first'
    };
  }

  private async analyzeStateManagement(): Promise<any> {
    const stateFiles = await this.findFiles('src', ['.ts', '.tsx', '.js', '.jsx']);
    
    return {
      approach: 'react-hooks',
      patterns: ['useState', 'useContext'],
      libraries: []
    };
  }

  private async analyzeDataFetchingPatterns(): Promise<any> {
    const componentFiles = await this.findFiles('src/components', ['.tsx', '.jsx']);
    
    return {
      methods: ['fetch', 'axios'],
      patterns: 'client-side',
      libraries: []
    };
  }

  private async findFiles(dir: string, extensions: string[]): Promise<string[]> {
    const files: string[] = [];
    
    const scanDir = (currentDir: string) => {
      if (!fs.existsSync(path.join(this.projectRoot, currentDir))) return;
      
      const items = fs.readdirSync(path.join(this.projectRoot, currentDir));
      
      for (const item of items) {
        const itemPath = path.join(currentDir, item);
        const fullPath = path.join(this.projectRoot, itemPath);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDir(itemPath);
        } else if (stat.isFile()) {
          const ext = path.extname(item);
          if (extensions.includes(ext)) {
            files.push(itemPath);
          }
        }
      }
    };
    
    scanDir(dir);
    return files;
  }

  private async extractDatabaseRelatedFiles(): Promise<string[]> {
    const databaseFiles = await this.findFiles('src', ['.ts', '.tsx', '.js', '.jsx']);
    return databaseFiles.filter(file => 
      file.includes('db') || 
      file.includes('database') || 
      file.includes('schema') ||
      file.includes('model') ||
      file.includes('api')
    );
  }

  private async extractUIRelatedFiles(): Promise<string[]> {
    return await this.findFiles('src/components', ['.tsx', '.jsx']);
  }

  private async extractAPIRelatedFiles(): Promise<string[]> {
    return await this.findFiles('src/app/api', ['.ts', '.js']);
  }

  private classifyQuery(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('database') || lowerQuery.includes('schema') || lowerQuery.includes('table')) {
      return 'database';
    } else if (lowerQuery.includes('component') || lowerQuery.includes('ui') || lowerQuery.includes('frontend')) {
      return 'frontend';
    } else if (lowerQuery.includes('api') || lowerQuery.includes('endpoint') || lowerQuery.includes('route')) {
      return 'api';
    } else if (lowerQuery.includes('auth') || lowerQuery.includes('user') || lowerQuery.includes('login')) {
      return 'auth';
    } else {
      return 'general';
    }
  }

  private async generateCacheKey(): Promise<string> {
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Simple cache key based on package.json and timestamp
    return `${packageJson.name}-${packageJson.version}-${Date.now()}`;
  }

  private synthesizeContext(analyses: any[]): ProjectContext {
    return {
      projectStructure: analyses.find(a => a.type === 'structure')?.data,
      patterns: {},
      dependencies: analyses.find(a => a.type === 'dependencies')?.data,
      integrations: {},
      summary: this.createSummary(analyses)
    };
  }

  private createSummary(analyses: any[]): string {
    const summaries = analyses.map(a => a.summary).filter(Boolean);
    return summaries.join('\n\n');
  }

  private async findDatabaseIntegrationPoints(): Promise<any> {
    return {
      current: 'none',
      potential: ['api-routes', 'server-actions', 'middleware']
    };
  }

  private async findAPIIntegrationPoints(): Promise<any> {
    return {
      current: 'app-router',
      potential: ['api-routes', 'server-actions']
    };
  }

  private async findUIIntegrationPoints(): Promise<any> {
    return {
      current: 'react-components',
      potential: ['hooks', 'context', 'state-management']
    };
  }

  private async findStateIntegrationPoints(): Promise<any> {
    return {
      current: 'react-hooks',
      potential: ['context', 'reducers', 'external-state']
    };
  }

  private summarizeStructure(structure: any): string {
    return `Project uses Next.js App Router with ${Object.keys(structure.src || {}).length} source directories`;
  }

  private summarizePatterns(patterns: any): string {
    return `Uses functional components with ${patterns.styling?.approach || 'CSS'} styling`;
  }

  private summarizeDependencies(packageJson: any): string {
    const deps = Object.keys(packageJson.dependencies || {}).length;
    const devDeps = Object.keys(packageJson.devDependencies || {}).length;
    return `Project has ${deps} dependencies and ${devDeps} dev dependencies`;
  }

  private summarizeIntegrations(integrations: any): string {
    return `Ready for database integration via ${integrations.database?.potential?.join(', ') || 'API routes'}`;
  }
} 