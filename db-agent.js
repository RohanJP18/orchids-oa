#!/usr/bin/env node

require('dotenv').config()
const { Command } = require('commander')
const inquirer = require('inquirer')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const { DatabaseAgent } = require('./src/agent/database-agent')

// Custom chalk styles for Orchids branding
const orchids = {
  primary: chalk.hex('#6366f1'), // Indigo
  secondary: chalk.hex('#8b5cf6'), // Purple
  accent: chalk.hex('#06b6d4'), // Cyan
  success: chalk.hex('#10b981'), // Emerald
  warning: chalk.hex('#f59e0b'), // Amber
  error: chalk.hex('#ef4444'), // Red
  muted: chalk.hex('#6b7280'), // Gray
  light: chalk.hex('#f3f4f6'), // Light gray
  dark: chalk.hex('#1f2937'), // Dark gray
  white: chalk.white,
  bold: chalk.bold
}

// Beautiful ASCII art banner for ORCHIDS
const orchidsBanner = `
${orchids.accent.bold('╔══════════════════════════════════════════════════════════════════════════════════════════════════════╗')}
${orchids.accent.bold('║')}                                                                                                    ${orchids.accent.bold('║')}
${orchids.accent.bold('║')}  ${orchids.primary.bold(' ██████╗ ██████╗  ██████╗██╗  ██╗██╗██████╗ ███████╗')}                                    ${orchids.accent.bold('║')}
${orchids.accent.bold('║')}  ${orchids.primary.bold('██╔═══██╗██╔══██╗██╔════╝██║  ██║██║██╔══██╗██╔════╝')}                                    ${orchids.accent.bold('║')}
${orchids.accent.bold('║')}  ${orchids.primary.bold('██║   ██║██████╔╝██║     ███████║██║██║  ██║███████╗')}                                    ${orchids.accent.bold('║')}
${orchids.accent.bold('║')}  ${orchids.primary.bold('██║   ██║██╔══██╗██║     ██╔══██║██║██║  ██║╚════██║')}                                    ${orchids.accent.bold('║')}
${orchids.accent.bold('║')}  ${orchids.primary.bold('╚██████╔╝██║  ██║╚██████╗██║  ██║██║██████╔╝███████║')}                                    ${orchids.accent.bold('║')}
${orchids.accent.bold('║')}  ${orchids.primary.bold(' ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝╚═════╝ ╚══════╝')}                                    ${orchids.accent.bold('║')}
${orchids.accent.bold('║')}                                                                                                    ${orchids.accent.bold('║')}
${orchids.accent.bold('║')}  ${orchids.secondary.bold('Database Agent - AI-Powered Database Management for Modern Web Applications')}        ${orchids.accent.bold('║')}
${orchids.accent.bold('║')}  ${orchids.muted('Welcome to Orchids Database Agent. Type your queries naturally and let AI handle the rest.')}    ${orchids.accent.bold('║')}
${orchids.accent.bold('║')}                                                                                                    ${orchids.accent.bold('║')}
${orchids.accent.bold('╚══════════════════════════════════════════════════════════════════════════════════════════════════════╝')}
`

// Utility functions for clean output
const ui = {
  showBanner: () => {
    console.clear()
    console.log(orchidsBanner)
  },
  
  header: (text) => {
    console.log('')
    console.log(orchids.primary.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
    console.log(orchids.primary.bold(`  ${text}`))
    console.log(orchids.primary.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
    console.log('')
  },
  
  section: (text) => {
    console.log('')
    console.log(orchids.secondary.bold(`  ${text}`))
    console.log(orchids.muted('  ──────────────────────────────────────────────────────────────────────────────────'))
  },
  
  step: (number, text) => {
    console.log('')
    console.log(orchids.accent.bold(`  Step ${number}`))
    console.log(orchids.white(`  ${text}`))
  },
  
  action: (text) => {
    console.log(orchids.muted(`    ${text}`))
  },
  
  file: (path) => {
    console.log(orchids.light(`      📄 ${path}`))
  },
  
  success: (text) => {
    console.log(orchids.success(`      ✅ ${text}`))
  },
  
  error: (text) => {
    console.log(orchids.error(`      ❌ ${text}`))
  },
  
  warning: (text) => {
    console.log(orchids.warning(`      ⚠️  ${text}`))
  },
  
  info: (text) => {
    console.log(orchids.accent(`      ℹ️  ${text}`))
  },
  
  thinking: (text) => {
    console.log(orchids.muted(`      🤔 ${text}`))
  },
  
  processing: (text) => {
    console.log(orchids.accent(`      ⚙️  ${text}`))
  },
  
  complete: () => {
    console.log('')
    console.log(orchids.success.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
    console.log(orchids.success.bold('  ✅ Operation completed successfully'))
    console.log(orchids.success.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
    console.log('')
  },
  
  errorBanner: (text) => {
    console.log('')
    console.log(orchids.error.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
    console.log(orchids.error.bold(`  ❌ ${text}`))
    console.log(orchids.error.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
    console.log('')
  },
  
  interactivePrompt: async () => {
    console.log('')
    console.log(orchids.white('  I\'m here to help you implement database features for your project.'))
    console.log(orchids.muted('  Tell me what you\'d like to accomplish:'))
    console.log('')
    
    // Simple prompt without inquirer
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    return new Promise((resolve) => {
      rl.question(`${orchids.accent('🤖')} ${orchids.primary('What database feature would you like me to implement?')} `, (answer) => {
        rl.close()
        if (answer.trim().length === 0) {
          console.log(orchids.error('Please enter a query'))
          return resolve('Can you store the recently played songs in a table')
        }
        resolve(answer)
      })
    })
  }
}

const program = new Command()

// Custom help formatting
program.configureHelp({
  sortSubcommands: true,
  subcommandTerm: (cmd) => cmd.name(),
  optionTerm: (option) => option.flags,
  helpWidth: 80
})

// Show banner function
const showBannerIfNeeded = () => {
  // Only show banner if not already shown
  if (!process.env.BANNER_SHOWN) {
    ui.showBanner()
    process.env.BANNER_SHOWN = 'true'
  }
}

program
  .name('orchids')
  .description('Orchids Database Agent - AI-powered database management for modern web applications')
  .version('1.0.0')

program
  .command('query')
  .description('Execute a database-related query with AI assistance')
  .argument('[query]', 'The database query to execute')
  .option('-i, --interactive', 'Run in interactive mode with guided prompts')
  .option('-v, --verbose', 'Show detailed processing information')
  .action(async (query, options) => {
    try {
      showBannerIfNeeded()
      const agent = new DatabaseAgent(options.verbose)
      
      // Always use interactive mode for better UX
      const finalQuery = query || await ui.interactivePrompt()
      
      ui.section('QUERY ANALYSIS')
      console.log(orchids.white(`  Query: ${orchids.primary.bold(finalQuery)}`))
      
      await agent.processQuery(finalQuery, ui)
      
      ui.complete()
      
      // Ask if user wants to run another query
      console.log(orchids.muted('  Press Enter to run another query, or Ctrl+C to exit...'))
      
    } catch (error) {
      ui.errorBanner('Operation failed')
      console.log(orchids.error(`  Error: ${error.message}`))
      console.log('')
      process.exit(1)
    }
  })

program
  .command('setup')
  .description('Initialize the database agent and setup project infrastructure')
  .option('-f, --force', 'Force reinstallation of dependencies')
  .action(async (options) => {
    try {
      showBannerIfNeeded()
      const agent = new DatabaseAgent()
      await agent.setup(ui, options)
      
      ui.complete()
      
    } catch (error) {
      ui.errorBanner('Setup failed')
      console.log(orchids.error(`  Error: ${error.message}`))
      console.log('')
      process.exit(1)
    }
  })

program
  .command('status')
  .description('Check the current status of your database and project')
  .action(async () => {
    try {
      showBannerIfNeeded()
      const agent = new DatabaseAgent()
      await agent.getStatus(ui)
      
    } catch (error) {
      ui.errorBanner('Status check failed')
      console.log(orchids.error(`  Error: ${error.message}`))
      console.log('')
      process.exit(1)
    }
  })

// Default command - interactive mode
program
  .command('interactive')
  .description('Start interactive mode (default)')
  .action(async () => {
    try {
      showBannerIfNeeded()
      const agent = new DatabaseAgent()
      
      while (true) {
        const query = await ui.interactivePrompt()
        
        ui.section('QUERY ANALYSIS')
        console.log(orchids.white(`  Query: ${orchids.primary.bold(query)}`))
        
        await agent.processQuery(query, ui)
        
        ui.complete()
        
        // Ask if user wants to continue
        const readline = require('readline')
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        })
        
        const continue_ = await new Promise((resolve) => {
          rl.question(`${orchids.accent('🤖')} ${orchids.primary('Would you like to run another query? (y/n)')} `, (answer) => {
            rl.close()
            resolve(answer.toLowerCase().startsWith('y'))
          })
        })
        
        if (!continue_) {
          console.log(orchids.muted('  Thanks for using Orchids Database Agent! 👋'))
          break
        }
        
        // Clear screen and show banner again
        ui.showBanner()
      }
      
    } catch (error) {
      if (error.message === 'User force closed the prompt with 0 null bytes.') {
        console.log(orchids.muted('  Thanks for using Orchids Database Agent! 👋'))
        return
      }
      
      ui.errorBanner('Operation failed')
      console.log(orchids.error(`  Error: ${error.message}`))
      console.log('')
      process.exit(1)
    }
  })

// Custom help command
program.addHelpText('after', `

${orchids.primary.bold('Examples:')}
  $ orchids query "Can you store the recently played songs in a table"
  $ orchids query -i
  $ orchids setup
  $ orchids status
  $ orchids interactive

${orchids.muted('For more information, visit: https://github.com/RohanJP18/orchids-oa')}
`)

// Override help to show banner first
const originalHelp = program.helpInformation
program.helpInformation = function() {
  const banner = orchidsBanner
  const helpText = originalHelp.call(this)
  return banner + '\n' + helpText
}

// If no command is provided, run interactive mode
if (process.argv.length === 2) {
  ui.showBanner()
  program.parse(['node', 'db-agent.js', 'interactive'])
} else {
  program.parse()
} 