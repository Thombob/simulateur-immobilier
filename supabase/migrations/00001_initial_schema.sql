-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name       TEXT,
    avatar_url      TEXT,
    notion_token    TEXT,
    notion_sync_enabled BOOLEAN DEFAULT FALSE,
    preferences     JSONB DEFAULT '{
        "theme": "system",
        "default_view": "table",
        "language": "fr",
        "ai_auto_analyze": true
    }'::jsonb,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CATEGORIES (hierarchical taxonomy)
-- ============================================================
CREATE TABLE categories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    slug            TEXT NOT NULL,
    description     TEXT,
    color           TEXT,
    icon            TEXT,
    parent_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
    sort_order      INTEGER DEFAULT 0,
    is_auto_created BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, slug)
);

CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- ============================================================
-- TAGS
-- ============================================================
CREATE TABLE tags (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    slug            TEXT NOT NULL,
    color           TEXT,
    usage_count     INTEGER DEFAULT 0,
    is_auto_created BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, slug)
);

CREATE INDEX idx_tags_user ON tags(user_id);

-- ============================================================
-- IDEAS
-- ============================================================
CREATE TABLE ideas (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    raw_input       TEXT NOT NULL,
    summary         TEXT,
    description     TEXT,
    category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
    subcategory_id  UUID REFERENCES categories(id) ON DELETE SET NULL,
    status          TEXT DEFAULT 'draft' CHECK (status IN ('draft','analyzing','scored','active','archived','rejected')),
    source          TEXT DEFAULT 'text' CHECK (source IN ('text','voice')),
    voice_audio_url TEXT,

    -- AI Analysis
    business_model  JSONB,
    risks           JSONB,
    required_skills TEXT[],
    next_actions    TEXT[],
    execution_plan  JSONB,
    swot            JSONB,
    competitors     JSONB,
    ai_analysis     JSONB,

    -- Sync
    notion_page_id  TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ideas_user ON ideas(user_id);
CREATE INDEX idx_ideas_status ON ideas(user_id, status);
CREATE INDEX idx_ideas_category ON ideas(category_id);
CREATE INDEX idx_ideas_created ON ideas(user_id, created_at DESC);

-- ============================================================
-- IDEA_SCORES
-- ============================================================
CREATE TABLE idea_scores (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id              UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    user_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    economic_potential    NUMERIC(3,1) CHECK (economic_potential BETWEEN 0 AND 10),
    execution_ease        NUMERIC(3,1) CHECK (execution_ease BETWEEN 0 AND 10),
    capital_required      NUMERIC(3,1) CHECK (capital_required BETWEEN 0 AND 10),
    time_required         NUMERIC(3,1) CHECK (time_required BETWEEN 0 AND 10),
    scalability           NUMERIC(3,1) CHECK (scalability BETWEEN 0 AND 10),
    skill_compatibility   NUMERIC(3,1) CHECK (skill_compatibility BETWEEN 0 AND 10),
    success_probability   NUMERIC(3,1) CHECK (success_probability BETWEEN 0 AND 10),
    global_score          NUMERIC(4,2),
    recommended_priority  TEXT DEFAULT 'medium' CHECK (recommended_priority IN ('low','medium','high','urgent')),
    ai_reasoning          JSONB,
    created_at            TIMESTAMPTZ DEFAULT NOW(),
    updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scores_idea ON idea_scores(idea_id);
CREATE INDEX idx_scores_global ON idea_scores(user_id, global_score DESC);

-- ============================================================
-- IDEA_TAGS (junction)
-- ============================================================
CREATE TABLE idea_tags (
    idea_id     UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    tag_id      UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (idea_id, tag_id)
);

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE projects (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    idea_id         UUID REFERENCES ideas(id) ON DELETE SET NULL,
    name            TEXT NOT NULL,
    description     TEXT,
    objective       TEXT,
    roadmap         JSONB,
    budget          NUMERIC(12,2),
    deadline        DATE,
    priority        TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
    status          TEXT DEFAULT 'ideation' CHECK (status IN ('ideation','planning','in_progress','paused','completed','abandoned')),
    sprint_30       TEXT[],
    sprint_90       TEXT[],
    notion_page_id  TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(user_id, status);

-- ============================================================
-- PROJECT_MILESTONES
-- ============================================================
CREATE TABLE project_milestones (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT,
    deadline        DATE,
    completed       BOOLEAN DEFAULT FALSE,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_milestones_project ON project_milestones(project_id);

-- ============================================================
-- TASKS
-- ============================================================
CREATE TABLE tasks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    project_id      UUID REFERENCES projects(id) ON DELETE SET NULL,
    title           TEXT NOT NULL,
    description     TEXT,
    priority        TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
    status          TEXT DEFAULT 'todo' CHECK (status IN ('todo','in_progress','blocked','done')),
    deadline        DATE,
    notion_page_id  TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_user ON tasks(user_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(user_id, status);

-- ============================================================
-- KNOWLEDGE
-- ============================================================
CREATE TABLE knowledge (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    project_id      UUID REFERENCES projects(id) ON DELETE SET NULL,
    subject         TEXT NOT NULL,
    summary         TEXT,
    level           TEXT DEFAULT 'beginner' CHECK (level IN ('beginner','intermediate','advanced','expert')),
    sources         TEXT[],
    books           TEXT[],
    experts         TEXT[],
    learning_plan   JSONB,
    notion_page_id  TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_knowledge_user ON knowledge(user_id);

-- ============================================================
-- PEOPLE
-- ============================================================
CREATE TABLE people (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    company         TEXT,
    role            TEXT,
    linkedin_url    TEXT,
    email           TEXT,
    notes           TEXT,
    project_ids     UUID[],
    notion_page_id  TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_people_user ON people(user_id);

-- ============================================================
-- DECISIONS
-- ============================================================
CREATE TABLE decisions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    project_id          UUID REFERENCES projects(id) ON DELETE SET NULL,
    subject             TEXT NOT NULL,
    context             TEXT,
    options             JSONB,
    ai_recommendation   TEXT,
    final_decision      TEXT,
    status              TEXT DEFAULT 'pending' CHECK (status IN ('pending','decided','revisiting')),
    notion_page_id      TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_decisions_user ON decisions(user_id);

-- ============================================================
-- CONNECTIONS (cross-entity links)
-- ============================================================
CREATE TABLE connections (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    source_type     TEXT NOT NULL CHECK (source_type IN ('idea','project','knowledge','person')),
    source_id       UUID NOT NULL,
    target_type     TEXT NOT NULL CHECK (target_type IN ('idea','project','knowledge','person')),
    target_id       UUID NOT NULL,
    relationship    TEXT NOT NULL,
    strength        NUMERIC(3,1) CHECK (strength BETWEEN 0 AND 10),
    ai_generated    BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_type, source_id, target_type, target_id)
);

CREATE INDEX idx_connections_source ON connections(source_type, source_id);
CREATE INDEX idx_connections_target ON connections(target_type, target_id);
CREATE INDEX idx_connections_user ON connections(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Generic policy for all user-owned tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['categories','tags','ideas','idea_scores','projects','project_milestones','tasks','knowledge','people','decisions','connections'])
    LOOP
        EXECUTE format('CREATE POLICY "Users can view own %1$s" ON %1$s FOR SELECT USING (auth.uid() = user_id)', tbl);
        EXECUTE format('CREATE POLICY "Users can insert own %1$s" ON %1$s FOR INSERT WITH CHECK (auth.uid() = user_id)', tbl);
        EXECUTE format('CREATE POLICY "Users can update own %1$s" ON %1$s FOR UPDATE USING (auth.uid() = user_id)', tbl);
        EXECUTE format('CREATE POLICY "Users can delete own %1$s" ON %1$s FOR DELETE USING (auth.uid() = user_id)', tbl);
    END LOOP;
END $$;

-- idea_tags needs special handling (no user_id column)
DROP POLICY IF EXISTS "Users can view own idea_tags" ON idea_tags;
DROP POLICY IF EXISTS "Users can insert own idea_tags" ON idea_tags;
DROP POLICY IF EXISTS "Users can update own idea_tags" ON idea_tags;
DROP POLICY IF EXISTS "Users can delete own idea_tags" ON idea_tags;
CREATE POLICY "Users can manage idea_tags" ON idea_tags FOR ALL
    USING (EXISTS (SELECT 1 FROM ideas WHERE ideas.id = idea_tags.idea_id AND ideas.user_id = auth.uid()));

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON ideas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON idea_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON project_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON knowledge FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON people FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON decisions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
