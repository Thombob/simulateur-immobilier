export type IdeaStatus = 'draft' | 'analyzing' | 'scored' | 'active' | 'archived' | 'rejected';
export type ProjectStatus = 'ideation' | 'planning' | 'in_progress' | 'paused' | 'completed' | 'abandoned';
export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type KnowledgeLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type DecisionStatus = 'pending' | 'decided' | 'revisiting';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  notion_token: string | null;
  openai_api_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  icon: string | null;
  color: string | null;
  user_id: string;
  created_at: string;
}

export interface IdeaScore {
  economic_potential: number;
  execution_ease: number;
  capital_required: number;
  time_required: number;
  scalability: number;
  skill_compatibility: number;
  success_probability: number;
  global_score: number;
  priority_rank: number;
}

export interface Idea {
  id: string;
  user_id: string;
  title: string;
  raw_input: string;
  summary: string | null;
  description: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  status: IdeaStatus;
  score: IdeaScore | null;
  business_model: string | null;
  risks: string[] | null;
  required_skills: string[] | null;
  next_actions: string[] | null;
  execution_plan: string | null;
  ai_analysis: Record<string, unknown> | null;
  tags: string[];
  notion_page_id: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  subcategory?: Category;
}

export interface Project {
  id: string;
  user_id: string;
  idea_id: string | null;
  name: string;
  description: string | null;
  objective: string | null;
  roadmap: ProjectMilestone[] | null;
  budget: number | null;
  deadline: string | null;
  priority: TaskPriority;
  status: ProjectStatus;
  sprint_30: string[] | null;
  sprint_90: string[] | null;
  notion_page_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  completed: boolean;
  order: number;
}

export interface Task {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string | null;
  notion_page_id: string | null;
  created_at: string;
  updated_at: string;
  project?: Project;
}

export interface Knowledge {
  id: string;
  user_id: string;
  project_id: string | null;
  subject: string;
  summary: string | null;
  level: KnowledgeLevel;
  sources: string[] | null;
  books: string[] | null;
  experts: string[] | null;
  learning_plan: LearningStep[] | null;
  notion_page_id: string | null;
  created_at: string;
  updated_at: string;
  project?: Project;
}

export interface LearningStep {
  id: string;
  title: string;
  description: string | null;
  resources: string[];
  completed: boolean;
  order: number;
}

export interface Person {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  role: string | null;
  linkedin_url: string | null;
  email: string | null;
  notes: string | null;
  project_ids: string[];
  notion_page_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DecisionOption {
  id: string;
  label: string;
  pros: string[];
  cons: string[];
}

export interface Decision {
  id: string;
  user_id: string;
  project_id: string | null;
  subject: string;
  context: string | null;
  options: DecisionOption[];
  ai_recommendation: string | null;
  final_decision: string | null;
  status: DecisionStatus;
  notion_page_id: string | null;
  created_at: string;
  updated_at: string;
  project?: Project;
}

export interface Connection {
  id: string;
  user_id: string;
  source_type: 'idea' | 'project' | 'knowledge' | 'person';
  source_id: string;
  target_type: 'idea' | 'project' | 'knowledge' | 'person';
  target_id: string;
  relationship: string;
  strength: number | null;
  ai_generated: boolean;
  created_at: string;
}
