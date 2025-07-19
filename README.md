# Spotify Clone with Database Agent

A Spotify clone built with Next.js 15, TypeScript, and Tailwind CSS, featuring an AI-powered database agent that can automatically implement database features based on natural language queries.

## Features

- **Spotify Clone UI**: Complete Spotify-like interface with sidebar, main content, and player
- **Database Agent**: AI-powered CLI tool that can implement database features automatically
- **Drizzle ORM**: Type-safe database operations with SQLite
- **API Routes**: RESTful endpoints for database operations
- **Real-time Data**: Frontend fetches data from database instead of hardcoded values

## Database Agent

The database agent is an AI-powered CLI tool that can:

- Analyze your project structure
- Generate database schemas
- Create API routes
- Integrate database functionality into the frontend
- Handle data migration and seeding

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up your OpenAI API key in a `.env` file:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

3. Initialize the database agent:
```bash
npm run db-agent setup
```

### Usage

#### Interactive Mode
```bash
npm run db-agent query -i
```

#### Direct Query
```bash
npm run db-agent query "Can you store the recently played songs in a table"
```

#### Example Queries

1. **Recently Played Songs**:
   ```bash
   npm run db-agent query "Can you store the recently played songs in a table"
   ```

2. **Made for You Playlists**:
   ```bash
   npm run db-agent query "Can you store the 'Made for you' and 'Popular albums' in a table"
   ```

### What the Agent Does

When you run a query, the database agent will:

1. **Analyze Project**: Understand the current codebase structure
2. **Generate Plan**: Use AI to create a detailed implementation plan
3. **Execute Changes**: 
   - Create/update database schemas
   - Generate API routes
   - Update frontend components
   - Seed data
4. **Integrate**: Connect the database to the frontend

## Database Schema

The project uses Drizzle ORM with SQLite and includes three main tables:

### Recently Played
- `id`: Unique identifier
- `title`: Song/playlist title
- `artist`: Artist name
- `album`: Album name
- `image`: Cover image URL
- `duration`: Duration in seconds
- `playedAt`: Timestamp of when it was played

### Made For You
- `id`: Unique identifier
- `title`: Playlist title
- `artist`: Artist/creator
- `album`: Album/collection name
- `image`: Cover image URL
- `duration`: Duration in seconds
- `description`: Playlist description
- `category`: Playlist category

### Popular Albums
- `id`: Unique identifier
- `title`: Album title
- `artist`: Artist name
- `album`: Album name
- `image`: Cover image URL
- `duration`: Duration in seconds
- `releaseYear`: Year of release
- `genre`: Music genre

## API Endpoints

- `GET /api/recently-played` - Fetch recently played songs
- `POST /api/recently-played` - Add a recently played song
- `GET /api/made-for-you` - Fetch made for you playlists
- `POST /api/made-for-you` - Add a made for you playlist
- `GET /api/popular-albums` - Fetch popular albums
- `POST /api/popular-albums` - Add a popular album

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file with your OpenAI API key
4. Run the database agent setup: `npm run db-agent setup`
5. Start the development server: `npm run dev`

### Database Commands

- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio

### Testing the Agent

1. Start the development server: `npm run dev`
2. Run a database query: `npm run db-agent query "Can you store the recently played songs in a table"`
3. The agent will automatically:
   - Create database tables
   - Generate API routes
   - Update the frontend to fetch from the database
   - Seed the database with sample data

## Architecture

```
├── src/
│   ├── app/
│   │   ├── api/           # API routes for database operations
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Main Spotify app
│   ├── components/        # React components
│   │   ├── spotify-main-content.tsx
│   │   ├── spotify-sidebar.tsx
│   │   ├── spotify-player.tsx
│   │   └── spotify-header.tsx
│   ├── db/               # Database configuration
│   │   ├── index.ts      # Database connection
│   │   ├── schema.ts     # Database schema
│   │   └── seed.ts       # Data seeding
│   └── agent/            # Database agent
│       └── database-agent.js
├── db-agent.js           # CLI entry point
├── drizzle.config.ts     # Drizzle configuration
└── package.json
```

## Technologies Used

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Database**: SQLite with Drizzle ORM
- **AI**: OpenAI GPT-4 for code generation
- **CLI**: Commander.js, Inquirer.js, Chalk
- **UI Components**: Radix UI, Lucide React icons

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the database agent with your changes
5. Submit a pull request

## License

MIT License - see LICENSE file for details
