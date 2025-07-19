#!/usr/bin/env node

require('dotenv').config()
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const { execSync } = require('child_process')

function showDatabaseState(stage) {
  console.log(chalk.blue(`\n📊 DATABASE STATE - ${stage}`))
  console.log(chalk.gray('='.repeat(50)))
  
  // Check if database file exists
  const dbFile = './spotify.db'
  if (fs.existsSync(dbFile)) {
    console.log(chalk.green(`✅ Database file exists: ${dbFile}`))
    const stats = fs.statSync(dbFile)
    console.log(chalk.gray(`   Size: ${(stats.size / 1024).toFixed(2)} KB`))
    console.log(chalk.gray(`   Created: ${stats.birthtime}`))
    console.log(chalk.gray(`   Modified: ${stats.mtime}`))
    
          // Try to show database schema
      try {
        const Database = require('better-sqlite3')
        const db = new Database(dbFile)
      
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
      console.log(chalk.cyan(`   📋 Tables found: ${tables.length}`))
      tables.forEach(table => {
        console.log(chalk.gray(`      - ${table.name}`))
        
        // Show data count for each table
        try {
          const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get()
          console.log(chalk.gray(`      📊 ${table.name}: ${count.count} rows`))
        } catch (error) {
          console.log(chalk.gray(`      📊 ${table.name}: Error reading count`))
        }
      })
      db.close()
    } catch (error) {
      console.log(chalk.yellow(`   ⚠️  Could not connect to database: ${error.message}`))
    }
  } else {
    console.log(chalk.red(`❌ Database file does not exist: ${dbFile}`))
  }
  
  // Check for drizzle migrations
  const drizzleDir = './drizzle'
  if (fs.existsSync(drizzleDir)) {
    console.log(chalk.green(`✅ Drizzle migrations directory exists`))
    const files = fs.readdirSync(drizzleDir)
    console.log(chalk.gray(`   Migration files: ${files.length}`))
    files.forEach(file => {
      console.log(chalk.gray(`      - ${file}`))
    })
  } else {
    console.log(chalk.yellow(`⚠️  No Drizzle migrations directory found`))
  }
  
  // Check for API routes
  const apiDir = './src/app/api'
  if (fs.existsSync(apiDir)) {
    console.log(chalk.green(`✅ API routes directory exists`))
    const routes = fs.readdirSync(apiDir, { recursive: true })
      .filter(file => file.endsWith('route.ts'))
    console.log(chalk.gray(`   API routes: ${routes.length}`))
    routes.forEach(route => {
      console.log(chalk.gray(`      - ${route}`))
    })
  } else {
    console.log(chalk.yellow(`⚠️  No API routes directory found`))
  }
  
  console.log(chalk.gray('='.repeat(50)))
}

async function runAgentQuery() {
  console.log(chalk.blue('\n🤖 RUNNING DATABASE AGENT'))
  console.log(chalk.gray('='.repeat(50)))
  
  try {
    execSync('npm run db-agent query "Can you store the recently played songs in a table"', { 
      stdio: 'inherit' 
    })
    console.log(chalk.green('\n✅ Agent completed successfully!'))
  } catch (error) {
    console.log(chalk.red('\n❌ Agent failed:'), error.message)
  }
}

async function main() {
  console.log(chalk.bold.blue('🔍 DATABASE TRANSFORMATION TEST'))
  console.log(chalk.gray('Testing: "Can you store the recently played songs in a table"'))
  
  // Show initial state
  showDatabaseState('BEFORE AGENT RUNS')
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Run the agent
  await runAgentQuery()
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Show final state
  showDatabaseState('AFTER AGENT COMPLETES')
  
  console.log(chalk.bold.green('\n🎉 Database transformation test completed!'))
}

main().catch(console.error) 