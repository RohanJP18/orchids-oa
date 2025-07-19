#!/usr/bin/env node

require('dotenv').config()
const { Command } = require('commander')
const inquirer = require('inquirer')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const { DatabaseAgent } = require('./src/agent/database-agent')

const program = new Command()

program
  .name('db-agent')
  .description('AI-powered database agent for Next.js projects')
  .version('1.0.0')

program
  .command('query')
  .description('Run a database-related query')
  .argument('[query]', 'The database query to execute')
  .option('-i, --interactive', 'Run in interactive mode')
  .action(async (query, options) => {
    try {
      const agent = new DatabaseAgent()
      
      if (options.interactive || !query) {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'query',
            message: 'What database feature would you like me to implement?',
            default: query || 'Can you store the recently played songs in a table'
          }
        ])
        query = answers.query
      }

      console.log(chalk.blue('🤖 Database Agent Starting...'))
      console.log(chalk.gray(`Query: ${query}`))
      console.log('')

      await agent.processQuery(query)
      
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message)
      process.exit(1)
    }
  })

program
  .command('setup')
  .description('Setup the database agent and initialize database')
  .action(async () => {
    try {
      console.log(chalk.blue('🔧 Setting up Database Agent...'))
      
      const agent = new DatabaseAgent()
      await agent.setup()
      
      console.log(chalk.green('✅ Setup complete!'))
    } catch (error) {
      console.error(chalk.red('❌ Setup failed:'), error.message)
      process.exit(1)
    }
  })

program.parse() 