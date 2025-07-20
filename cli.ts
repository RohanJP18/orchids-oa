#!/usr/bin/env node

import dotenv from 'dotenv';
import chalk from 'chalk';

// Load environment variables from .env file
dotenv.config();
import boxen from 'boxen';
import gradient from 'gradient-string';
import figlet from 'figlet';
import ora from 'ora';
import inquirer from 'inquirer';
import { terminal } from 'terminal-kit';
import cliProgress from 'cli-progress';
import * as diff from 'diff';
import path from 'path';
import fs from 'fs';

// Import our CLI components
import { OrchidsCLI } from './src/cli/orchids-cli';
import { showBanner } from './src/cli/banner';
import { ProjectAnalyzer } from './src/cli/project-analyzer';
import { InteractivePlanner } from './src/cli/interactive-planner';
import { ProgressiveExecutor } from './src/cli/progressive-executor';
import { ResultsDisplay } from './src/cli/results-display';
import { SuccessAnimations } from './src/cli/success-animations';

// Main CLI orchestration
class OrchidsDBCLI {
  private cli: OrchidsCLI;
  private analyzer: ProjectAnalyzer;
  private planner: InteractivePlanner;
  private executor: ProgressiveExecutor;
  private results: ResultsDisplay;
  private animations: SuccessAnimations;

  constructor() {
    const projectRoot = process.cwd();
    this.cli = new OrchidsCLI(projectRoot);
    this.analyzer = new ProjectAnalyzer();
    this.planner = new InteractivePlanner();
    this.executor = new ProgressiveExecutor(projectRoot);
    this.results = new ResultsDisplay();
    this.animations = new SuccessAnimations();
  }

  async run() {
    try {
      // 1. Show stunning banner
      showBanner();
      
      // 2. Initialize CLI interface and let it handle the rest
      await this.cli.initialize();
      
    } catch (error) {
      console.error(chalk.red.bold('\n💥 Fatal Error:'), error);
      process.exit(1);
    }
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n👋 Goodbye! Thanks for using Orchids Database Agent.'));
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(chalk.yellow('\n\n👋 Goodbye! Thanks for using Orchids Database Agent.'));
  process.exit(0);
});

// Run the CLI
if (require.main === module) {
  const orchidsCLI = new OrchidsDBCLI();
  orchidsCLI.run();
}

export { OrchidsDBCLI }; 