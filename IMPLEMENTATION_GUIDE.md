# Database Agent Implementation Guide

## Overview

The Database Agent is an AI-powered CLI tool that can automatically implement database features in a Next.js project based on natural language queries. This guide explains how it works and how to extend it.

## Architecture

### Core Components

1. **CLI Interface** (`db-agent.js`)
   - Entry point for the database agent
   - Handles command-line arguments and user interaction
   - Uses Commander.js for CLI framework

2. **Database Agent** (`src/agent/database-agent.js`)
   - Main agent class that orchestrates the entire process
   - Analyzes project structure
   - Generates implementation plans using AI
   - Executes code changes

3. **Database Layer** (`src/db/`)
   - Schema definitions using Drizzle ORM
   - Database connection and configuration
   - Data seeding scripts

4. **API Routes** (`src/app/api/`)
   - RESTful endpoints for database operations
   - Handles CRUD operations for each data type

5. **Frontend Integration** (`src/components/`)
   - Updated components to fetch from database
   - Loading states and error handling

## How It Works

### 1. Project Analysis

The agent starts by analyzing the project structure:

```javascript
async analyzeProject() {
  this.context.projectStructure = {
    hasDatabase: fs.existsSync(path.join(this.projectRoot, 'src/db')),
    hasApiRoutes: fs.existsSync(path.join(this.projectRoot, 'src/app/api')),
    components: this.findComponents(),
    dataStructures: this.extractDataStructures()
  }
}
```

### 2. AI-Powered Planning

The agent uses OpenAI's GPT-4 to generate implementation plans:

```javascript
async generatePlan(query) {
  const prompt = `
    You are a database agent for a Spotify clone Next.js project...
    [Detailed prompt with project context]
  `
  
  const completion = await this.openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
  })
  
  return JSON.parse(completion.choices[0].message.content)
}
```

### 3. Plan Execution

The agent executes the AI-generated plan step by step:

```javascript
async executePlan(plan) {
  for (const step of plan.steps) {
    console.log(chalk.cyan(`📝 Step ${step.step}: ${step.action}`))
    
    for (const file of step.files) {
      await this.modifyFile(file, step.code)
    }
  }
}
```

## Database Schema

### Recently Played Table

```typescript
export const recentlyPlayed = sqliteTable('recently_played', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  artist: text('artist').notNull(),
  album: text('album').notNull(),
  image: text('image'),
  duration: integer('duration').notNull(),
  playedAt: integer('played_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
```

### Made For You Table

```typescript
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
```

### Popular Albums Table

```typescript
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
```

## API Endpoints

### Recently Played

```typescript
// GET /api/recently-played
export async function GET() {
  const songs = await db.select().from(recentlyPlayed).orderBy(recentlyPlayed.playedAt)
  return NextResponse.json({ success: true, data: songs })
}

// POST /api/recently-played
export async function POST(request: Request) {
  const body = await request.json()
  const newSong = await db.insert(recentlyPlayed).values({
    ...body,
    playedAt: new Date()
  }).returning()
  return NextResponse.json({ success: true, data: newSong[0] })
}
```

## Frontend Integration

### Data Fetching

The main content component now fetches data from the API:

```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [recentlyPlayedResponse, madeForYouResponse, popularAlbumsResponse] = 
        await Promise.all([
          fetch('/api/recently-played'),
          fetch('/api/made-for-you'),
          fetch('/api/popular-albums')
        ])
      
      const [recentlyPlayedData, madeForYouData, popularAlbumsData] = 
        await Promise.all([
          recentlyPlayedResponse.json(),
          madeForYouResponse.json(),
          popularAlbumsResponse.json()
        ])
      
      if (recentlyPlayedData.success) setRecentlyPlayed(recentlyPlayedData.data)
      if (madeForYouData.success) setMadeForYou(madeForYouData.data)
      if (popularAlbumsData.success) setPopularAlbums(popularAlbumsData.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  fetchData()
}, [])
```

### Loading States

The component shows loading skeletons while data is being fetched:

```typescript
{loading ? (
  // Loading skeleton
  Array.from({ length: 6 }).map((_, index) => (
    <div key={index} className="flex-shrink-0">
      <div className="w-[180px] h-[180px] bg-[var(--color-muted)] rounded-lg animate-pulse"></div>
      <div className="mt-4 space-y-2">
        <div className="h-4 bg-[var(--color-muted)] rounded animate-pulse"></div>
        <div className="h-3 bg-[var(--color-muted)] rounded animate-pulse w-2/3"></div>
      </div>
    </div>
  ))
) : (
  // Actual data
  recentlyPlayed.map((item, index) => (
    <MusicCard key={index} {...item} />
  ))
)}
```

## Extending the Agent

### Adding New Data Types

1. **Update Schema**: Add new table to `src/db/schema.ts`
2. **Create API Route**: Add new route in `src/app/api/`
3. **Update Seeding**: Add seed data to `src/db/seed.ts`
4. **Extend Frontend**: Update components to fetch new data

### Example: Adding User Playlists

```typescript
// 1. Add to schema
export const userPlaylists = sqliteTable('user_playlists', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  userId: text('user_id').notNull(),
  description: text('description'),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// 2. Create API route
// src/app/api/user-playlists/route.ts

// 3. Add to seeding
// src/db/seed.ts

// 4. Update frontend
// src/components/spotify-main-content.tsx
```

### Customizing AI Prompts

The AI prompts can be customized in `src/agent/database-agent.js`:

```javascript
async generatePlan(query) {
  const prompt = `
    You are a database agent for a [YOUR_PROJECT_TYPE] Next.js project.
    
    Project Context:
    - [Your specific project details]
    - [Your database framework]
    - [Your current data structures]
    
    User Query: "${query}"
    
    [Your custom instructions]
  `
  // ... rest of the method
}
```

## Testing

### Manual Testing

1. **Setup**: `npm run db-agent setup`
2. **Test Query**: `npm run db-agent query "Can you store the recently played songs in a table"`
3. **Verify**: Check that database tables, API routes, and frontend updates are created

### Automated Testing

Create test scripts to verify the agent's functionality:

```javascript
// test-agent-functionality.js
const { DatabaseAgent } = require('./src/agent/database-agent')

async function testAgent() {
  const agent = new DatabaseAgent()
  
  // Test project analysis
  await agent.analyzeProject()
  console.log('Project analysis:', agent.context.projectStructure)
  
  // Test plan generation (with mock AI response)
  const mockPlan = {
    steps: [
      {
        step: 1,
        action: "Create database schema",
        files: ["src/db/schema.ts"],
        code: "// Mock schema code"
      }
    ]
  }
  
  // Test plan execution
  await agent.executePlan(mockPlan)
}
```

## Best Practices

### 1. Error Handling

Always include proper error handling:

```javascript
try {
  await agent.processQuery(query)
} catch (error) {
  console.error(chalk.red('❌ Error:'), error.message)
  // Rollback changes if necessary
}
```

### 2. Backup Strategy

Create backups before making changes:

```javascript
async backupFiles(files) {
  for (const file of files) {
    const backupPath = `${file}.backup.${Date.now()}`
    fs.copyFileSync(file, backupPath)
  }
}
```

### 3. Validation

Validate AI-generated code before execution:

```javascript
async validatePlan(plan) {
  // Check that required fields are present
  if (!plan.steps || !Array.isArray(plan.steps)) {
    throw new Error('Invalid plan structure')
  }
  
  // Validate each step
  for (const step of plan.steps) {
    if (!step.action || !step.files || !step.code) {
      throw new Error(`Invalid step: ${JSON.stringify(step)}`)
    }
  }
}
```

### 4. Logging

Implement comprehensive logging:

```javascript
class Logger {
  static info(message) {
    console.log(chalk.blue(`ℹ️  ${message}`))
  }
  
  static success(message) {
    console.log(chalk.green(`✅ ${message}`))
  }
  
  static warning(message) {
    console.log(chalk.yellow(`⚠️  ${message}`))
  }
  
  static error(message) {
    console.log(chalk.red(`❌ ${message}`))
  }
}
```

## Troubleshooting

### Common Issues

1. **Dependencies Not Found**
   - Run `npm install --legacy-peer-deps`
   - Check that all required packages are in package.json

2. **Database Connection Errors**
   - Ensure SQLite is properly configured
   - Check file permissions for database file

3. **AI API Errors**
   - Verify OpenAI API key is set in .env
   - Check API quota and rate limits

4. **Frontend Not Loading Data**
   - Check browser console for errors
   - Verify API routes are working
   - Ensure database is seeded with data

### Debug Mode

Add debug logging to the agent:

```javascript
class DatabaseAgent {
  constructor(debug = false) {
    this.debug = debug
    // ... rest of constructor
  }
  
  log(message) {
    if (this.debug) {
      console.log(chalk.gray(`[DEBUG] ${message}`))
    }
  }
}
```

## Future Enhancements

### 1. Multi-Database Support

Extend to support PostgreSQL, MySQL, MongoDB:

```javascript
class DatabaseAgent {
  constructor(databaseType = 'sqlite') {
    this.databaseType = databaseType
    this.setupDatabase()
  }
  
  setupDatabase() {
    switch (this.databaseType) {
      case 'postgresql':
        // PostgreSQL setup
        break
      case 'mysql':
        // MySQL setup
        break
      case 'mongodb':
        // MongoDB setup
        break
      default:
        // SQLite setup
    }
  }
}
```

### 2. Advanced Code Generation

Use AST parsing for more precise code modifications:

```javascript
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const generate = require('@babel/generator').default

async modifyFileWithAST(filePath, modifications) {
  const code = fs.readFileSync(filePath, 'utf8')
  const ast = parser.parse(code, { sourceType: 'module' })
  
  // Apply modifications to AST
  traverse(ast, modifications)
  
  const output = generate(ast, {}, code)
  fs.writeFileSync(filePath, output.code)
}
```

### 3. Template System

Create templates for common database patterns:

```javascript
const templates = {
  crud: {
    schema: 'templates/crud-schema.ts',
    api: 'templates/crud-api.ts',
    component: 'templates/crud-component.tsx'
  },
  auth: {
    schema: 'templates/auth-schema.ts',
    api: 'templates/auth-api.ts',
    middleware: 'templates/auth-middleware.ts'
  }
}
```

This implementation guide provides a comprehensive overview of how the database agent works and how to extend it for your specific needs. 