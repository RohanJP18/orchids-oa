# 🌺 Orchids Database Agent - AI-Powered Database Operations

A revolutionary AI-powered database agent for Next.js projects that can directly manipulate PostgreSQL databases using natural language queries. This is not just another ORM or migration tool - it's an intelligent agent that understands your database needs and executes them directly.

## 🚀 What Makes This Special

### **Direct Database Manipulation**
- **No file generation**: Creates tables directly in PostgreSQL using SQL
- **Real-time operations**: Every query affects your actual database immediately
- **Natural language**: "Create a users table" → Executes `CREATE TABLE users` directly
- **Seamless workflow**: Create, modify, delete tables with simple commands

### **AI-Powered Intelligence**
- **Context-aware**: Understands your project structure and existing database
- **Smart suggestions**: Provides intelligent recommendations based on your needs
- **Risk assessment**: Evaluates operations before executing them
- **Execution planning**: Creates detailed plans for complex operations

### **Production-Ready CLI**
- **Beautiful interface**: Stunning terminal UI with gradients and animations
- **Real-time progress**: Live progress bars and status updates
- **Multiple modes**: Chat, Quick Command, Wizard, and Analysis modes
- **Professional UX**: Commercial-quality user experience

## 🎯 What You Can Do

### **Database Operations**
```bash
# Create tables
"Can you store the recently played songs in a table"
"Create a users table with email and username"

# Delete tables  
"Delete the made_for_you table"
"Drop all tables from the database"

# Modify tables
"Add a playlist_id column to the songs table"
"Remove the old_column from users table"
```

### **Real-Time Analysis**
- View current database state
- See all tables and their schemas
- Monitor connection status
- Track changes in real-time

## 🛠️ Quick Start

### 1. Clone and Setup
```bash
git clone https://github.com/RohanJP18/orchids-oa.git
cd orchids-oa
git checkout finished-db-jul20
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# OpenAI API Configuration  
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Run the Database Agent
```bash
npm run orchids
```

### 4. Start Chatting with Your Database
```
💭 What would you like the database agent to do?
> Can you store the recently played songs in a table
```

## 🎨 Features

### **Direct Database Operations**
- ✅ Create tables directly in PostgreSQL
- ✅ Delete tables with natural language
- ✅ Modify table schemas
- ✅ Real-time database state analysis
- ✅ Connection status monitoring

### **AI-Powered Intelligence**
- ✅ Natural language query processing
- ✅ Context-aware planning
- ✅ Risk assessment and validation
- ✅ Smart table structure generation
- ✅ Intelligent column mapping

### **Beautiful CLI Interface**
- ✅ Stunning gradient banners and animations
- ✅ Real-time progress tracking
- ✅ Interactive chat mode
- ✅ Multiple interaction paradigms
- ✅ Professional user experience

### **Next.js Integration**
- ✅ App Router support
- ✅ TypeScript throughout
- ✅ Drizzle ORM integration
- ✅ API route generation
- ✅ Frontend component integration

## 📊 Example Workflow

### 1. **Start the Agent**
```bash
npm run orchids
```

### 2. **Analyze Current State**
```
📊 Project Analysis Mode
🗄️ Database Status: ✅ Connected
📋 Total Tables: 3
📋 Tables: API, Drizzle, recently_played_songs
```

### 3. **Create New Tables**
```
💭 What would you like the database agent to do?
> Can you store the 'Made for you' and 'Popular albums' in a table

🤔 Review the execution plan:
1. Create table 'made_for_you' directly in database
2. Create table 'popular_albums' directly in database
3. Integrate Drizzle ORM to interact with tables
4. Create API endpoints to fetch data
5. Develop frontend components

✔ 🤔 Does this plan look good to you? Yes
```

### 4. **Watch Real-Time Execution**
```
🚀 AI Agent executing plan...
✅ Database connection established
📝 Executing: Create table 'made_for_you' directly in database
🏗️ Creating table: made_for_you
✅ Table made_for_you created successfully
📝 Executing: Create table 'popular_albums' directly in database
🏗️ Creating table: popular_albums
✅ Table popular_albums created successfully
```

### 5. **Verify Results**
```
📊 PROJECT ANALYSIS
🗄️ Database Status: ✅ Connected
📋 Total Tables: 5
📋 Tables: API, Drizzle, made_for_you, popular_albums, recently_played_songs
```

## 🔧 Technical Architecture

### **Core Components**
- **AI Agent** (`src/agent/ai-agent.ts`): Main intelligence engine
- **Database Connector** (`src/agent/database-connector.ts`): Direct PostgreSQL operations
- **CLI Interface** (`src/cli/orchids-cli.ts`): Beautiful terminal UI
- **Context Manager** (`src/agent/context-manager.ts`): Project analysis and context
- **Implementers**: API, Database, and Frontend integration

### **Technologies**
- **Next.js 15** with App Router
- **TypeScript** throughout
- **PostgreSQL** with direct SQL execution
- **Drizzle ORM** for type safety
- **OpenAI GPT-4** for AI operations
- **Rich CLI** with chalk, boxen, inquirer

## 🎯 Use Cases

### **Development**
- Rapid prototyping with natural language
- Database schema evolution
- Feature development with instant database setup

### **Production**
- Database maintenance and updates
- Schema migrations with AI assistance
- Real-time database operations

### **Learning**
- Understand database operations through natural language
- Learn SQL through AI-generated examples
- Explore database concepts interactively

## 🚀 Why This Stands Out

### **Not Just Another ORM**
- Direct database manipulation, not file generation
- AI-powered intelligence, not just code generation
- Real-time operations, not just migrations

### **Production Quality**
- Commercial-grade CLI interface
- Comprehensive error handling
- Professional user experience
- Type-safe implementation

### **Innovation**
- Natural language database operations
- Context-aware AI planning
- Real-time database state analysis
- Seamless Next.js integration

## 📚 Documentation

- **[CLI Documentation](CLI_README.md)**: Detailed CLI interface guide
- **[Database Agent Guide](CLI_README.md)**: AI agent functionality
- **[Setup Instructions](CLI_README.md)**: Environment configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the database agent
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**🌺 Orchids Database Agent** - Where AI meets database operations in the most beautiful way possible.
