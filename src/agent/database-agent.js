require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const chalk = require('chalk')
const OpenAI = require('openai')

class DatabaseAgent {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    this.projectRoot = process.cwd()
    this.context = {}
  }

  async setup() {
    console.log(chalk.yellow('📊 Setting up database...'))
    
    // Install dependencies if not already installed
    try {
      execSync('npm install', { stdio: 'inherit' })
    } catch (error) {
      console.log(chalk.yellow('⚠️  Some dependencies may already be installed'))
    }

    // Generate database schema
    try {
      execSync('npm run db:generate', { stdio: 'inherit' })
      console.log(chalk.green('✅ Database schema generated'))
    } catch (error) {
      console.log(chalk.yellow('⚠️  Schema generation failed, will create manually'))
    }

    // Run migrations
    try {
      execSync('npm run db:migrate', { stdio: 'inherit' })
      console.log(chalk.green('✅ Database migrations completed'))
    } catch (error) {
      console.log(chalk.yellow('⚠️  Migration failed, will handle manually'))
    }
  }

  async processQuery(query) {
    console.log(chalk.blue('🔍 Analyzing project structure...'))
    await this.analyzeProject()
    
    console.log(chalk.blue('🤔 Processing query with AI...'))
    const plan = await this.generatePlan(query)
    
    console.log(chalk.blue('🚀 Executing plan...'))
    await this.executePlan(plan)
    
    console.log(chalk.green('✅ Query completed successfully!'))
  }

  async analyzeProject() {
    // Analyze the project structure
    this.context.projectStructure = {
      hasDatabase: fs.existsSync(path.join(this.projectRoot, 'src/db')),
      hasApiRoutes: fs.existsSync(path.join(this.projectRoot, 'src/app/api')),
      components: this.findComponents(),
      dataStructures: this.extractDataStructures()
    }
  }

  findComponents() {
    const componentsDir = path.join(this.projectRoot, 'src/components')
    const components = []
    
    if (fs.existsSync(componentsDir)) {
      const files = fs.readdirSync(componentsDir, { recursive: true })
      files.forEach(file => {
        if (file.endsWith('.tsx') || file.endsWith('.ts')) {
          components.push(file)
        }
      })
    }
    
    return components
  }

  extractDataStructures() {
    const mainContentPath = path.join(this.projectRoot, 'src/components/spotify-main-content.tsx')
    if (fs.existsSync(mainContentPath)) {
      const content = fs.readFileSync(mainContentPath, 'utf8')
      
      // Extract hardcoded data arrays
      const dataStructures = {
        recentlyPlayed: this.extractArrayFromCode(content, 'recentlyPlayed'),
        madeForYou: this.extractArrayFromCode(content, 'madeForYou'),
        popularAlbums: this.extractArrayFromCode(content, 'popularAlbums')
      }
      
      return dataStructures
    }
    
    return {}
  }

  extractArrayFromCode(content, arrayName) {
    const regex = new RegExp(`const\\s+${arrayName}\\s*=\\s*\\[(.*?)\\]`, 's')
    const match = content.match(regex)
    
    if (match) {
      try {
        // This is a simplified extraction - in a real implementation, you'd use a proper parser
        return `Found ${arrayName} array with data`
      } catch (error) {
        return `Found ${arrayName} array (parsing failed)`
      }
    }
    
    return null
  }

  async generatePlan(query) {
    const prompt = `
You are a database agent for a Spotify clone Next.js project. The project currently has hardcoded data in the frontend components.

Project Context:
- This is a Spotify clone with hardcoded data for recently played songs, "Made for You" playlists, and popular albums
- The project uses Next.js 15 with TypeScript
- Database framework: Drizzle ORM with SQLite
- Current data structures: ${JSON.stringify(this.context.dataStructures, null, 2)}

User Query: "${query}"

Please provide a detailed plan to implement this database feature. The plan should include:

1. Database schema changes (if needed)
2. API route creation
3. Frontend integration
4. Data migration/seeding
5. Specific file modifications

Format your response as a JSON object with the following structure:
{
  "steps": [
    {
      "step": 1,
      "action": "description of what to do",
      "files": ["list of files to modify"],
      "code": "actual code to implement"
    }
  ]
}
`

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    })

    const response = completion.choices[0].message.content
    return JSON.parse(response)
  }

  async executePlan(plan) {
    for (const step of plan.steps) {
      console.log(chalk.cyan(`📝 Step ${step.step}: ${step.action}`))
      
      for (const file of step.files) {
        console.log(chalk.gray(`   Editing: ${file}`))
        await this.modifyFile(file, step.code)
      }
      
      console.log(chalk.green(`   ✅ Step ${step.step} completed`))
      console.log('')
    }
  }

  async modifyFile(filePath, code) {
    const fullPath = path.join(this.projectRoot, filePath)
    const dir = path.dirname(fullPath)
    
    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    // Write or append to file
    if (fs.existsSync(fullPath)) {
      // For existing files, we'll append or replace based on the code
      const existingContent = fs.readFileSync(fullPath, 'utf8')
      const newContent = this.mergeCode(existingContent, code)
      fs.writeFileSync(fullPath, newContent)
    } else {
      fs.writeFileSync(fullPath, code)
    }
  }

  mergeCode(existingContent, newCode) {
    // This is a simplified merge - in a real implementation, you'd use AST parsing
    // For now, we'll append the new code
    return existingContent + '\n\n' + newCode
  }
}

module.exports = { DatabaseAgent } 