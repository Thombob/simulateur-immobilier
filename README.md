# Life OS AI

Chief of Staff personnel augmente par l'IA. Second cerveau intelligent pour capturer, organiser et executer tes idees.

## Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **IA**: OpenAI GPT-4o + Whisper
- **Organisation**: Notion API
- **Auth**: Supabase Auth

## Fonctionnalites

- Capture d'idees (texte + voix)
- Analyse IA automatique (reformulation, categorisation, scoring 7 criteres, SWOT, modele economique, plan d'action)
- Taxonomie hierarchique auto-generee
- 6 bases de donnees : Ideas, Projects, Tasks, Knowledge, People, Decisions
- Mode Mentor (parcours d'apprentissage, livres, ressources)
- Mode Coach (challenge des idees, risques, alternatives)
- Mode Execution (roadmap, sprints, milestones)
- Decouverte de connexions entre entites
- Sync Notion

## Setup

```bash
npm install
cp .env.example .env.local
# Remplir les variables d'environnement
npm run dev
```

## Variables d'environnement

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
NOTION_INTEGRATION_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Schema Supabase

Executer `supabase/migrations/00001_initial_schema.sql` dans l'editeur SQL de Supabase pour creer toutes les tables.
