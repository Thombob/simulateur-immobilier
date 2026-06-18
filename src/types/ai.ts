export interface ReformulationResult {
  title: string;
  summary: string;
  description: string;
  key_points: string[];
}

export interface TaxonomyResult {
  category: string;
  subcategory: string | null;
  tags: string[];
  is_new_category: boolean;
  is_new_subcategory: boolean;
}

export interface ScoreCriterion {
  score: number;
  reasoning: string;
}

export interface ScoreResult {
  economic_potential: ScoreCriterion;
  execution_ease: ScoreCriterion;
  capital_required: ScoreCriterion;
  time_required: ScoreCriterion;
  scalability: ScoreCriterion;
  skill_compatibility: ScoreCriterion;
  success_probability: ScoreCriterion;
  global_score: number;
  recommended_priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface SwotResult {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  risk_summary: string;
  competitors: Competitor[];
}

export interface Competitor {
  name: string;
  url: string | null;
  description: string;
  market_position: string;
}

export interface BusinessModelResult {
  model_type: string;
  description: string;
  revenue_streams: string[];
  target_market: string;
  value_proposition: string;
  key_resources: string[];
  cost_structure: string[];
}

export interface ActionStep {
  id: string;
  title: string;
  description: string;
  timeline: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dependencies: string[];
}

export interface ActionPlanResult {
  objective: string;
  milestones: ActionStep[];
  sprint_30_days: string[];
  sprint_90_days: string[];
  next_actions: string[];
}

export interface ConnectionResult {
  source_type: string;
  source_id: string;
  target_type: string;
  target_id: string;
  relationship: string;
  strength: number;
  description: string;
}

export interface MentorResult {
  knowledge_gaps: KnowledgeGap[];
  learning_plan: LearningPlanStep[];
  recommended_books: BookRecommendation[];
  recommended_resources: ResourceRecommendation[];
  recommended_experts: string[];
}

export interface KnowledgeGap {
  topic: string;
  current_level: string;
  target_level: string;
  importance: number;
}

export interface LearningPlanStep {
  order: number;
  topic: string;
  description: string;
  duration: string;
  resources: string[];
}

export interface BookRecommendation {
  title: string;
  author: string;
  relevance: string;
}

export interface ResourceRecommendation {
  title: string;
  type: string;
  url: string | null;
  description: string;
}

export interface CoachResult {
  hypotheses: ChallengeItem[];
  risks: ChallengeItem[];
  weaknesses: ChallengeItem[];
  alternatives: AlternativeProposal[];
  overall_assessment: string;
}

export interface ChallengeItem {
  statement: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  explanation: string;
  mitigation: string;
}

export interface AlternativeProposal {
  title: string;
  description: string;
  advantages: string[];
  disadvantages: string[];
}

export interface FullAnalysisResult {
  reformulation: ReformulationResult;
  taxonomy: TaxonomyResult;
  scores: ScoreResult;
  swot: SwotResult;
  business_model: BusinessModelResult;
  action_plan: ActionPlanResult;
  connections: ConnectionResult[];
}

export interface AnalysisPipelineStatus {
  step: number;
  total_steps: number;
  current_step: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}
