# Database Setup Guide

## Option 1: Cloud Database (Recommended)

### Using Neon (Free PostgreSQL Cloud)
1. Go to https://neon.tech
2. Sign up and create a new project
3. Copy the DATABASE_URL from your dashboard
4. Update your `.env` file with the DATABASE_URL

### Using Supabase (Alternative)
1. Go to https://supabase.com
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. Update your `.env` file

## Option 2: Local PostgreSQL

### macOS (using Homebrew)
```bash
brew install postgresql
brew services start postgresql
createdb aura_stay_dashboard
```

### Create .env file
Copy `env.example` to `.env` and update DATABASE_URL:

```bash
cp env.example .env
```

Then edit `.env` with your database URL:
```
DATABASE_URL="postgresql://username:password@localhost:5432/aura_stay_dashboard"
```

## Initialize Database
Once you have the DATABASE_URL configured, run:

```bash
npm run db:generate
npm run db:push
```

This will:
1. Generate Prisma client
2. Push the schema to your database
3. Create all necessary tables 