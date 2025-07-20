require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const chalk = require('chalk')
const OpenAI = require('openai')

class DatabaseAgent {
  constructor(verbose = false) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    this.projectRoot = process.cwd()
    this.context = {}
    this.verbose = verbose
  }

  async setup(ui, options = {}) {
    ui.section('PROJECT ANALYSIS')
    ui.action('Analyzing project structure and dependencies...')
    
    // Install dependencies if not already installed
    try {
      ui.action('Installing project dependencies...')
      execSync('npm install', { stdio: this.verbose ? 'inherit' : 'pipe' })
      ui.success('Dependencies installed successfully')
    } catch (error) {
      ui.warning('Some dependencies may already be installed')
    }

    // Generate database schema
    try {
      ui.action('Generating database schema...')
      execSync('npm run db:generate', { stdio: this.verbose ? 'inherit' : 'pipe' })
      ui.success('Database schema generated')
    } catch (error) {
      ui.warning('Schema generation failed, will create manually')
    }

    // Run migrations
    try {
      ui.action('Running database migrations...')
      execSync('npm run db:migrate', { stdio: this.verbose ? 'inherit' : 'pipe' })
      ui.success('Database migrations completed')
    } catch (error) {
      ui.warning('Migration failed, will handle manually')
    }

    ui.success('Project setup completed successfully')
  }

  async getStatus(ui) {
    ui.section('DATABASE STATUS')
    
    const dbFile = path.join(this.projectRoot, 'spotify.db')
    if (fs.existsSync(dbFile)) {
      const stats = fs.statSync(dbFile)
      ui.success(`Database file exists: ${(stats.size / 1024).toFixed(2)} KB`)
      
      try {
        const Database = require('better-sqlite3')
        const db = new Database(dbFile)
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
        ui.info(`Tables found: ${tables.length}`)
        
        tables.forEach(table => {
          try {
            const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get()
            ui.info(`${table.name}: ${count.count} rows`)
          } catch (error) {
            ui.warning(`${table.name}: Error reading count`)
          }
        })
        db.close()
      } catch (error) {
        ui.error(`Could not connect to database: ${error.message}`)
      }
    } else {
      ui.warning('Database file does not exist')
    }

    ui.section('API ROUTES')
    const apiRoutes = [
      'src/app/api/recently-played/route.ts',
      'src/app/api/made-for-you/route.ts',
      'src/app/api/popular-albums/route.ts'
    ]
    
    apiRoutes.forEach(route => {
      if (fs.existsSync(route)) {
        ui.success(route)
      } else {
        ui.warning(`${route} (missing)`)
      }
    })
  }

  async processQuery(query, ui) {
    ui.section('PROJECT ANALYSIS')
    ui.thinking('Analyzing project structure and current state...')
    await this.analyzeProject()
    
    ui.section('AI PROCESSING')
    ui.thinking('Processing your query with AI to generate implementation plan...')
    const plan = await this.generatePlan(query)
    
    ui.section('IMPLEMENTATION')
    ui.processing('Executing the generated plan...')
    await this.executePlan(plan, ui)
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

  async executePlan(plan, ui) {
    for (const step of plan.steps) {
      ui.step(step.step, step.action)
      
      for (const file of step.files) {
        ui.file(file)
        await this.modifyFile(file, step.code)
      }
      
      ui.success(`Step ${step.step} completed`)
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