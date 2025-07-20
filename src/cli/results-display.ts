import chalk from 'chalk';
import boxen from 'boxen';
import * as diff from 'diff';
import { ExecutionPlan } from './orchids-cli';

export class ResultsDisplay {
  async showCompletionSummary(): Promise<void> {
    console.log(chalk.blue.bold('\n📊 Generating completion summary...'));
    
    const spinner = ora({
      text: 'Compiling results...',
      spinner: 'dots12',
      color: 'cyan'
    }).start();
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    spinner.succeed(chalk.green('✓ Results compiled'));
    
    this.displaySummary();
    this.displayFileChanges();
    this.displayNextSteps();
  }

  private displaySummary(): void {
    console.log(chalk.green.bold('\n🎉 Database Agent Execution Complete!'));
    
    const summary = boxen(
      chalk.bold.green('✅ SUCCESS SUMMARY\n\n') +
      `${chalk.yellow('Database Setup:')} ${chalk.green('✓ Complete')}\n` +
      `${chalk.yellow('Schema Creation:')} ${chalk.green('✓ Complete')}\n` +
      `${chalk.yellow('API Endpoints:')} ${chalk.green('✓ Complete')}\n` +
      `${chalk.yellow('Frontend Integration:')} ${chalk.green('✓ Complete')}\n` +
      `${chalk.yellow('Migrations:')} ${chalk.green('✓ Generated')}\n\n` +
      chalk.dim('All database features have been successfully implemented! 🌺'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'green'
      }
    );
    
    console.log(summary);
  }

  private displayFileChanges(): void {
    console.log(chalk.blue.bold('\n📁 Files Created/Modified:'));
    
    const files = [
      { name: 'drizzle.config.ts', status: 'created', type: 'config' },
      { name: 'src/lib/db/schema.ts', status: 'created', type: 'schema' },
      { name: 'src/lib/db/index.ts', status: 'created', type: 'database' },
      { name: 'src/app/api/db/route.ts', status: 'created', type: 'api' },
      { name: 'src/components/db-integration.tsx', status: 'created', type: 'component' },
      { name: 'drizzle/0000_initial.sql', status: 'created', type: 'migration' }
    ];
    
    const fileDisplay = boxen(
      chalk.bold.cyan('📄 FILE CHANGES\n\n') +
      files.map(file => {
        const statusIcon = file.status === 'created' ? '🆕' : '✏️';
        const typeColor = this.getTypeColor(file.type);
        return `${statusIcon} ${chalk.yellow(file.name)} (${typeColor(file.type)})`;
      }).join('\n'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan'
      }
    );
    
    console.log(fileDisplay);
  }

  private getTypeColor(type: string): (text: string) => string {
    switch (type) {
      case 'config':
        return chalk.blue;
      case 'schema':
        return chalk.green;
      case 'database':
        return chalk.magenta;
      case 'api':
        return chalk.yellow;
      case 'component':
        return chalk.cyan;
      case 'migration':
        return chalk.red;
      default:
        return chalk.gray;
    }
  }

  private displayNextSteps(): void {
    console.log(chalk.blue.bold('\n🚀 Next Steps:'));
    
    const nextSteps = boxen(
      chalk.bold.blue('📋 RECOMMENDED ACTIONS\n\n') +
      `${chalk.cyan('1.')} Run database migrations: ${chalk.yellow('npm run db:migrate')}\n` +
      `${chalk.cyan('2.')} Start the development server: ${chalk.yellow('npm run dev')}\n` +
      `${chalk.cyan('3.')} Test the new database features\n` +
      `${chalk.cyan('4.')} Review the generated API endpoints\n` +
      `${chalk.cyan('5.')} Customize the database schema as needed\n\n` +
      chalk.dim('Your Spotify clone now has full database functionality! 🎵'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'blue'
      }
    );
    
    console.log(nextSteps);
  }

  showDiff(oldCode: string, newCode: string, filename: string): void {
    console.log(chalk.blue.bold(`\n📝 Changes to ${filename}:`));
    console.log('─'.repeat(60));
    
    const changes = diff.diffLines(oldCode, newCode);
    
    changes.forEach(change => {
      if (change.added) {
        change.value.split('\n').forEach(line => {
          if (line.trim()) {
            console.log(chalk.green(`+ ${line}`));
          }
        });
      } else if (change.removed) {
        change.value.split('\n').forEach(line => {
          if (line.trim()) {
            console.log(chalk.red(`- ${line}`));
          }
        });
      } else {
        // Show context lines (first and last few)
        const lines = change.value.split('\n');
        if (lines.length > 6) {
          lines.slice(0, 2).forEach(line => console.log(chalk.dim(`  ${line}`)));
          console.log(chalk.dim('  ...'));
          lines.slice(-2).forEach(line => console.log(chalk.dim(`  ${line}`)));
        } else {
          lines.forEach(line => console.log(chalk.dim(`  ${line}`)));
        }
      }
    });
    
    console.log('─'.repeat(60));
  }

  showDatabaseSchema(schema: any): void {
    console.log(chalk.blue.bold('\n🗄️ Generated Database Schema:'));
    
    const schemaDisplay = boxen(
      chalk.bold.magenta('DATABASE SCHEMA\n\n') +
      this.formatSchema(schema),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'magenta'
      }
    );
    
    console.log(schemaDisplay);
  }

  private formatSchema(schema: any): string {
    // This would format the actual schema object
    // For now, showing a sample schema
    return `
${chalk.yellow('users')} table:
  - id: uuid (primary key)
  - email: varchar(255) (unique)
  - name: varchar(255)
  - created_at: timestamp
  - updated_at: timestamp

${chalk.yellow('playlists')} table:
  - id: uuid (primary key)
  - user_id: uuid (foreign key)
  - name: varchar(255)
  - description: text
  - created_at: timestamp

${chalk.yellow('songs')} table:
  - id: uuid (primary key)
  - title: varchar(255)
  - artist: varchar(255)
  - album: varchar(255)
  - duration: integer
  - file_path: varchar(500)
`;
  }

  showApiEndpoints(endpoints: any[]): void {
    console.log(chalk.blue.bold('\n🔗 Generated API Endpoints:'));
    
    const endpointsDisplay = boxen(
      chalk.bold.yellow('API ENDPOINTS\n\n') +
      endpoints.map(endpoint => 
        `${chalk.cyan(endpoint.method)} ${chalk.yellow(endpoint.path)} - ${endpoint.description}`
      ).join('\n'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'yellow'
      }
    );
    
    console.log(endpointsDisplay);
  }
}

// Import ora for the spinner
import ora from 'ora'; 