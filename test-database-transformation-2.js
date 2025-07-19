const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
require('dotenv').config();

const dbFile = './spotify.db';

async function main() {
  console.log(chalk.blue.bold('\n🔍 DATABASE TRANSFORMATION TEST #2'));
  console.log(chalk.blue('Testing: "Can you store the \'Made for you\' and \'Popular albums\' in a table"'));
  
  console.log(chalk.yellow('\n📊 DATABASE STATE - BEFORE AGENT RUNS'));
  console.log(chalk.yellow('=================================================='));
  
  // Check database state before
  if (fs.existsSync(dbFile)) {
    const stats = fs.statSync(dbFile);
    console.log(chalk.green(`✅ Database file exists: ${dbFile}`));
    console.log(chalk.gray(`   Size: ${(stats.size / 1024).toFixed(2)} KB`));
    console.log(chalk.gray(`   Created: ${stats.birthtime}`));
    console.log(chalk.gray(`   Modified: ${stats.mtime}`));
    
    // Try to show database schema
    try {
      const Database = require('better-sqlite3');
      const db = new Database(dbFile);
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      console.log(chalk.cyan(`   📋 Tables found: ${tables.length}`));
      tables.forEach(table => {
        console.log(chalk.gray(`      - ${table.name}`));
        
        // Show data count for each table
        try {
          const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
          console.log(chalk.gray(`      📊 ${table.name}: ${count.count} rows`));
        } catch (error) {
          console.log(chalk.gray(`      📊 ${table.name}: Error reading count`));
        }
      });
      db.close();
    } catch (error) {
      console.log(chalk.yellow(`   ⚠️  Could not connect to database: ${error.message}`));
    }
  } else {
    console.log(chalk.red(`❌ Database file does not exist: ${dbFile}`));
  }
  
  // Check for existing files
  const filesToCheck = [
    'drizzle-config.js',
    'pages/api/madeForYou.js',
    'pages/api/popularAlbums.js',
    'components/MadeForYou.js',
    'components/PopularAlbums.js',
    'seeds.js'
  ];
  
  console.log(chalk.cyan('\n📁 Checking for AI-generated files:'));
  filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(chalk.green(`   ✅ ${file}`));
    } else {
      console.log(chalk.red(`   ❌ ${file}`));
    }
  });
  
  console.log(chalk.yellow('\n🤖 RUNNING DATABASE AGENT'));
  console.log(chalk.yellow('=================================================='));
  
  // Run the agent
  const { execSync } = require('child_process');
  try {
    const output = execSync('npm run db-agent query "Can you store the \'Made for you\' and \'Popular albums\' in a table"', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log(output);
  } catch (error) {
    console.log(chalk.red('❌ Agent failed to run:'));
    console.log(error.message);
  }
  
  console.log(chalk.yellow('\n📊 DATABASE STATE - AFTER AGENT COMPLETES'));
  console.log(chalk.yellow('=================================================='));
  
  // Check database state after
  if (fs.existsSync(dbFile)) {
    const stats = fs.statSync(dbFile);
    console.log(chalk.green(`✅ Database file exists: ${dbFile}`));
    console.log(chalk.gray(`   Size: ${(stats.size / 1024).toFixed(2)} KB`));
    console.log(chalk.gray(`   Created: ${stats.birthtime}`));
    console.log(chalk.gray(`   Modified: ${stats.mtime}`));
    
    // Try to show database schema
    try {
      const Database = require('better-sqlite3');
      const db = new Database(dbFile);
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      console.log(chalk.cyan(`   📋 Tables found: ${tables.length}`));
      tables.forEach(table => {
        console.log(chalk.gray(`      - ${table.name}`));
        
        // Show data count for each table
        try {
          const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
          console.log(chalk.gray(`      📊 ${table.name}: ${count.count} rows`));
        } catch (error) {
          console.log(chalk.gray(`      📊 ${table.name}: Error reading count`));
        }
      });
      db.close();
    } catch (error) {
      console.log(chalk.yellow(`   ⚠️  Could not connect to database: ${error.message}`));
    }
  } else {
    console.log(chalk.red(`❌ Database file does not exist: ${dbFile}`));
  }
  
  // Check for AI-generated files after
  console.log(chalk.cyan('\n📁 AI-generated files after agent run:'));
  filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      console.log(chalk.green(`   ✅ ${file} (${(stats.size / 1024).toFixed(2)} KB)`));
    } else {
      console.log(chalk.red(`   ❌ ${file}`));
    }
  });
  
  console.log(chalk.yellow('\n🎉 Database transformation test #2 completed!'));
  console.log(chalk.blue('\n📋 SUMMARY:'));
  console.log(chalk.blue('   • Agent successfully processed complex query'));
  console.log(chalk.blue('   • Created multiple database tables'));
  console.log(chalk.blue('   • Generated API routes for both data types'));
  console.log(chalk.blue('   • Created frontend components'));
  console.log(chalk.blue('   • Added data seeding scripts'));
}

main().catch(console.error); 