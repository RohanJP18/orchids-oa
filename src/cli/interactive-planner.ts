import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';
import { ExecutionPlan, ExecutionStep } from '../agent/types';

export class InteractivePlanner {
  private projectContext: any = {};

  async createPlan(query: string): Promise<ExecutionPlan> {
    console.log(chalk.blue.bold('\n🧠 Creating execution plan...'));
    
    const spinner = ora({
      text: 'Analyzing requirements...',
      spinner: 'dots12',
      color: 'cyan'
    }).start();
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    spinner.succeed(chalk.green('✓ Requirements analyzed'));
    
    // Generate plan based on query
    const plan = this.generatePlanFromQuery(query);
    
    return plan;
  }

  async showExecutionPlan(plan: ExecutionPlan): Promise<void> {
    console.log(chalk.blue.bold('\n📋 Execution Plan Generated:'));
    
    const planDisplay = boxen(
      chalk.bold.blue('🚀 EXECUTION PLAN\n\n') +
      plan.steps.map((step, i) => 
        `${chalk.cyan(`${i+1}.`)} ${step.description}\n` +
        `   ${chalk.dim('Files:')} ${step.files.join(', ')}\n` +
        `   ${chalk.dim('Operation:')} ${step.operation}\n` +
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
  }

  private generatePlanFromQuery(query: string): ExecutionPlan {
    const lowerQuery = query.toLowerCase();
    
    // Default plan for any query
    const defaultPlan: ExecutionPlan = {
      steps: [
        {
          description: 'Set up Drizzle ORM configuration',
          files: ['drizzle.config.ts', 'package.json'],
          operation: 'install and configure',
          estimatedDuration: 30
        },
        {
          description: 'Create database schema definitions',
          files: ['src/lib/db/schema.ts', 'src/lib/db/index.ts'],
          operation: 'create schema files',
          estimatedDuration: 45
        },
        {
          description: 'Generate database migrations',
          files: ['drizzle/0000_initial.sql'],
          operation: 'generate migrations',
          estimatedDuration: 20
        },
        {
          description: 'Create API endpoints',
          files: ['src/app/api/db/route.ts'],
          operation: 'create API routes',
          estimatedDuration: 60
        },
        {
          description: 'Integrate with frontend components',
          files: ['src/components/db-integration.tsx'],
          operation: 'update components',
          estimatedDuration: 90
        }
      ],
      estimatedTime: '4 minutes',
      riskLevel: 'low'
    };

    // Customize plan based on query content
    if (lowerQuery.includes('user') || lowerQuery.includes('auth')) {
      return this.generateUserAuthPlan();
    } else if (lowerQuery.includes('playlist')) {
      return this.generatePlaylistPlan();
    } else if (lowerQuery.includes('song') || lowerQuery.includes('music')) {
      return this.generateMusicLibraryPlan();
    } else if (lowerQuery.includes('search')) {
      return this.generateSearchPlan();
    } else if (lowerQuery.includes('profile')) {
      return this.generateProfilePlan();
    }

    return defaultPlan;
  }

  private generateUserAuthPlan(): ExecutionPlan {
    return {
      steps: [
        {
          description: 'Set up Drizzle ORM with PostgreSQL',
          files: ['drizzle.config.ts', 'package.json'],
          operation: 'install and configure',
          estimatedDuration: 30
        },
        {
          description: 'Create user authentication schema',
          files: ['src/lib/db/schema/users.ts', 'src/lib/db/schema/auth.ts'],
          operation: 'create user tables',
          estimatedDuration: 60
        },
        {
          description: 'Generate authentication migrations',
          files: ['drizzle/0000_users.sql', 'drizzle/0001_auth.sql'],
          operation: 'generate migrations',
          estimatedDuration: 30
        },
        {
          description: 'Create authentication API endpoints',
          files: ['src/app/api/auth/register/route.ts', 'src/app/api/auth/login/route.ts'],
          operation: 'create auth routes',
          estimatedDuration: 90
        },
        {
          description: 'Integrate auth with Spotify UI',
          files: ['src/components/auth/login-form.tsx', 'src/components/auth/register-form.tsx'],
          operation: 'create auth components',
          estimatedDuration: 120
        }
      ],
      estimatedTime: '5 minutes',
      riskLevel: 'medium'
    };
  }

  private generatePlaylistPlan(): ExecutionPlan {
    return {
      steps: [
        {
          description: 'Set up Drizzle ORM configuration',
          files: ['drizzle.config.ts', 'package.json'],
          operation: 'install and configure',
          estimatedDuration: 30
        },
        {
          description: 'Create playlist and song schemas',
          files: ['src/lib/db/schema/playlists.ts', 'src/lib/db/schema/songs.ts'],
          operation: 'create playlist tables',
          estimatedDuration: 75
        },
        {
          description: 'Generate playlist migrations',
          files: ['drizzle/0000_playlists.sql'],
          operation: 'generate migrations',
          estimatedDuration: 25
        },
        {
          description: 'Create playlist management API',
          files: ['src/app/api/playlists/route.ts', 'src/app/api/playlists/[id]/route.ts'],
          operation: 'create playlist routes',
          estimatedDuration: 90
        },
        {
          description: 'Integrate with Spotify player UI',
          files: ['src/components/playlist/playlist-manager.tsx', 'src/components/playlist/playlist-item.tsx'],
          operation: 'create playlist components',
          estimatedDuration: 150
        }
      ],
      estimatedTime: '6 minutes',
      riskLevel: 'low'
    };
  }

  private generateMusicLibraryPlan(): ExecutionPlan {
    return {
      steps: [
        {
          description: 'Set up Drizzle ORM with music database',
          files: ['drizzle.config.ts', 'package.json'],
          operation: 'install and configure',
          estimatedDuration: 30
        },
        {
          description: 'Create comprehensive music schema',
          files: ['src/lib/db/schema/artists.ts', 'src/lib/db/schema/albums.ts', 'src/lib/db/schema/songs.ts'],
          operation: 'create music tables',
          estimatedDuration: 90
        },
        {
          description: 'Generate music library migrations',
          files: ['drizzle/0000_music_library.sql'],
          operation: 'generate migrations',
          estimatedDuration: 35
        },
        {
          description: 'Create music management API',
          files: ['src/app/api/music/route.ts', 'src/app/api/music/artists/route.ts'],
          operation: 'create music routes',
          estimatedDuration: 120
        },
        {
          description: 'Integrate with Spotify music player',
          files: ['src/components/music/music-library.tsx', 'src/components/music/song-player.tsx'],
          operation: 'create music components',
          estimatedDuration: 180
        }
      ],
      estimatedTime: '8 minutes',
      riskLevel: 'medium'
    };
  }

  private generateSearchPlan(): ExecutionPlan {
    return {
      steps: [
        {
          description: 'Set up Drizzle ORM with search capabilities',
          files: ['drizzle.config.ts', 'package.json'],
          operation: 'install and configure',
          estimatedDuration: 30
        },
        {
          description: 'Create searchable content schemas',
          files: ['src/lib/db/schema/search.ts', 'src/lib/db/schema/content.ts'],
          operation: 'create search tables',
          estimatedDuration: 60
        },
        {
          description: 'Generate search migrations',
          files: ['drizzle/0000_search.sql'],
          operation: 'generate migrations',
          estimatedDuration: 25
        },
        {
          description: 'Create search API endpoints',
          files: ['src/app/api/search/route.ts', 'src/app/api/search/suggestions/route.ts'],
          operation: 'create search routes',
          estimatedDuration: 90
        },
        {
          description: 'Integrate search with Spotify UI',
          files: ['src/components/search/search-bar.tsx', 'src/components/search/search-results.tsx'],
          operation: 'create search components',
          estimatedDuration: 120
        }
      ],
      estimatedTime: '5 minutes',
      riskLevel: 'low'
    };
  }

  private generateProfilePlan(): ExecutionPlan {
    return {
      steps: [
        {
          description: 'Set up Drizzle ORM for user profiles',
          files: ['drizzle.config.ts', 'package.json'],
          operation: 'install and configure',
          estimatedDuration: 30
        },
        {
          description: 'Create user profile schema',
          files: ['src/lib/db/schema/profiles.ts', 'src/lib/db/schema/preferences.ts'],
          operation: 'create profile tables',
          estimatedDuration: 60
        },
        {
          description: 'Generate profile migrations',
          files: ['drizzle/0000_profiles.sql'],
          operation: 'generate migrations',
          estimatedDuration: 25
        },
        {
          description: 'Create profile management API',
          files: ['src/app/api/profile/route.ts', 'src/app/api/profile/settings/route.ts'],
          operation: 'create profile routes',
          estimatedDuration: 90
        },
        {
          description: 'Integrate profile with Spotify settings',
          files: ['src/components/profile/profile-editor.tsx', 'src/components/profile/settings-panel.tsx'],
          operation: 'create profile components',
          estimatedDuration: 150
        }
      ],
      estimatedTime: '6 minutes',
      riskLevel: 'low'
    };
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
} 