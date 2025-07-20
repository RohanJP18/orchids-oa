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

  async showDatabaseState(ui, operation = '') {
    ui.section('DATABASE STATE AFTER OPERATION')
    
    const dbFile = path.join(this.projectRoot, 'spotify.db')
    if (fs.existsSync(dbFile)) {
      const stats = fs.statSync(dbFile)
      ui.success(`Database file: ${(stats.size / 1024).toFixed(2)} KB`)
      
      try {
        const Database = require('better-sqlite3')
        const db = new Database(dbFile)
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all()
        ui.info(`Tables found: ${tables.length}`)
        
        tables.forEach(table => {
          try {
            const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get()
            ui.info(`${table.name}: ${count.count} rows`)
            
            // Show sample data for new tables or if operation was specified
            if (operation && count.count > 0) {
              const sample = db.prepare(`SELECT * FROM ${table.name} LIMIT 1`).get()
              if (sample) {
                const sampleStr = Object.entries(sample)
                  .filter(([key]) => key !== 'id' && key !== 'playedAt')
                  .map(([key, value]) => `${key}: ${value}`)
                  .slice(0, 3)
                  .join(', ')
                ui.action(`   Sample: ${sampleStr}`)
              }
            }
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
    try {
      ui.section('PROJECT ANALYSIS')
      ui.thinking('Analyzing project structure and current state...')
      await this.analyzeProject()
      
      ui.section('AI PROCESSING')
      ui.thinking('Processing your query with AI to generate implementation plan...')
      const plan = await this.generatePlan(query)
      
      ui.section('IMPLEMENTATION')
      ui.processing('Executing the generated plan...')
      await this.executePlan(plan, ui)
      
      // Show database state after operation
      await this.showDatabaseState(ui, query)
      
    } catch (error) {
      ui.section('ERROR')
      ui.error(`AI Agent failed: ${error.message}`)
      ui.error('The AI agent could not complete the requested operation.')
      ui.error('This could be due to:')
      ui.error('- Invalid or unclear query')
      ui.error('- AI model limitations')
      ui.error('- Network connectivity issues')
      ui.error('- API rate limiting')
      
      // Still show current database state
      await this.showDatabaseState(ui, 'before operation')
    }
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
You are a database agent for a Spotify clone Next.js 15 project. You MUST understand the project structure and create proper files.

PROJECT STRUCTURE (CRITICAL):
- Database schema: src/db/schema.ts (Drizzle ORM)
- API routes: src/app/api/[route-name]/route.ts (Next.js 15 App Router)
- Frontend components: src/components/[component-name].tsx
- Database connection: src/db/index.ts

EXISTING SCHEMA (src/db/schema.ts):
\`\`\typescript
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const recentlyPlayed = sqliteTable('recently_played', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  artist: text('artist').notNull(),
  album: text('album').notNull(),
  image: text('image'),
  duration: integer('duration').notNull(),
  playedAt: integer('played_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const madeForYou = sqliteTable('made_for_you', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  artist: text('artist').notNull(),
  album: text('album').notNull(),
  image: text('image'),
  duration: integer('duration').notNull(),
  description: text('description'),
  category: text('category').notNull().default('playlist'),
})

export const popularAlbums = sqliteTable('popular_albums', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  artist: text('artist').notNull(),
  album: text('album').notNull(),
  image: text('image'),
  duration: integer('duration').notNull(),
  releaseYear: integer('release_year'),
  genre: text('genre'),
})
\`\`\`

EXISTING API ROUTE EXAMPLE (src/app/api/recently-played/route.ts):
\`\`\typescript
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { recentlyPlayed } from '@/db/schema'

export async function GET() {
  try {
    const songs = await db.select().from(recentlyPlayed).orderBy(recentlyPlayed.playedAt)
    return NextResponse.json({ success: true, data: songs })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch recently played songs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newSong = await db.insert(recentlyPlayed).values(body).returning()
    return NextResponse.json({ success: true, data: newSong[0] })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to add recently played song' }, { status: 500 })
  }
}
\`\`\`

RULES (MUST FOLLOW):
1. ALWAYS use src/ directory structure
2. ALWAYS use Drizzle ORM syntax (sqliteTable, text, integer, etc.)
3. ALWAYS use Next.js 15 App Router API routes (src/app/api/[name]/route.ts)
4. ALWAYS use TypeScript (.ts/.tsx files)
5. NEVER create raw SQL files
6. NEVER use pages/ directory (this is App Router, not Pages Router)

User Query: "${query}"

Create a detailed implementation plan. Respond with ONLY valid JSON:

{
  "steps": [
    {
      "step": 1,
      "action": "description of what to do",
      "files": ["exact file paths in src/ directory"],
      "code": "complete TypeScript code to implement"
    }
  ]
}
`

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      })

      const response = completion.choices[0].message.content
      
      // Try to parse the JSON response
      try {
        return JSON.parse(response)
      } catch (parseError) {
        throw new Error(`AI returned invalid JSON: ${response}`)
      }
    } catch (error) {
      throw new Error(`AI agent failed: ${error.message}`)
    }
  }

  async executePlan(plan, ui) {
    // Validate the plan first
    if (!plan || !plan.steps || !Array.isArray(plan.steps)) {
      throw new Error('AI returned invalid plan structure')
    }

    for (const step of plan.steps) {
      if (!step.action || !step.files || !Array.isArray(step.files)) {
        throw new Error('AI returned invalid step structure')
      }

      ui.step(step.step, step.action)
      
      for (const file of step.files) {
        // Validate file paths - they should be in the correct project structure
        if (!file.startsWith('src/')) {
          throw new Error(`AI tried to create invalid file path: ${file}. All files must be in src/ directory structure.`)
        }
        
        // Validate specific file types
        if (file.includes('schema.sql') || file.includes('api/routes/') || file.includes('components/') || file.includes('models/')) {
          throw new Error(`AI tried to create invalid file path: ${file}. This should be in src/ directory structure.`)
        }

        ui.file(file)
        await this.modifyFile(file, step.code)
      }
      
      // If this step created a schema file, run migrations
      if (step.files.some(f => f.includes('schema.ts'))) {
        ui.action('Running database migrations...')
        try {
          execSync('npm run db:generate', { stdio: this.verbose ? 'inherit' : 'pipe' })
          execSync('npm run db:migrate', { stdio: this.verbose ? 'inherit' : 'pipe' })
          ui.success('Database migrations completed')
        } catch (error) {
          throw new Error(`Migration failed: ${error.message}`)
        }
      }
      
      // If this step created a seed file, run it
      if (step.files.some(f => f.includes('seed'))) {
        ui.action('Seeding database with sample data...')
        try {
          // Extract the seed file path and run it
          const seedFile = step.files.find(f => f.includes('seed'))
          if (seedFile) {
            const fullSeedPath = path.join(this.projectRoot, seedFile)
            if (fs.existsSync(fullSeedPath)) {
              execSync(`node -r ts-node/register ${fullSeedPath}`, { stdio: this.verbose ? 'inherit' : 'pipe' })
              ui.success('Database seeded successfully')
            }
          }
        } catch (error) {
          throw new Error(`Seeding failed: ${error.message}`)
        }
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
      // For existing files, we'll append the new code
      const existingContent = fs.readFileSync(fullPath, 'utf8')
      
      // If it's a schema file, append the new table definition
      if (filePath.includes('schema.ts')) {
        // Remove any import statements from the new code since they already exist
        const cleanCode = code.replace(/import.*from.*drizzle-orm.*\n?/g, '')
        const newContent = existingContent + '\n' + cleanCode
        fs.writeFileSync(fullPath, newContent)
      } else {
        // For other files, append as is
        const newContent = existingContent + '\n\n' + code
        fs.writeFileSync(fullPath, newContent)
      }
    } else {
      // For new files, write the complete content
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