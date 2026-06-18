import { chatCompletion } from './openai';
import {
  REFORMULATION_SYSTEM,
  reformulationUserPrompt,
  CATEGORIZATION_SYSTEM,
  categorizationUserPrompt,
} from './prompts/analyze-idea';
import { SCORING_SYSTEM, scoringUserPrompt } from './prompts/score-idea';
import {
  SWOT_SYSTEM,
  swotUserPrompt,
  BUSINESS_MODEL_SYSTEM,
  businessModelUserPrompt,
} from './prompts/risk-analysis';
import { ACTION_PLAN_SYSTEM, actionPlanUserPrompt } from './prompts/action-plan';
import { CONNECTIONS_SYSTEM, connectionsUserPrompt } from './prompts/connections';
import type {
  FullAnalysisResult,
  ReformulationResult,
  TaxonomyResult,
  ScoreResult,
  SwotResult,
  BusinessModelResult,
  ActionPlanResult,
  ConnectionResult,
} from '@/types/ai';

interface PipelineContext {
  rawInput: string;
  existingCategories: string[];
  existingEntities: Array<{
    type: string;
    id: string;
    title: string;
    summary: string;
  }>;
}

export async function runAnalysisPipeline(
  ctx: PipelineContext
): Promise<FullAnalysisResult> {
  // Step 1: Reformulation
  const reformulationRaw = await chatCompletion(
    REFORMULATION_SYSTEM,
    reformulationUserPrompt(ctx.rawInput)
  );
  const reformulation: ReformulationResult = JSON.parse(reformulationRaw);

  // Step 2: Categorization
  const taxonomyRaw = await chatCompletion(
    CATEGORIZATION_SYSTEM,
    categorizationUserPrompt(reformulation.description, ctx.existingCategories)
  );
  const taxonomy: TaxonomyResult = JSON.parse(taxonomyRaw);

  // Steps 3-5: Parallel analysis
  const [scoresRaw, swotRaw, businessModelRaw] = await Promise.all([
    chatCompletion(
      SCORING_SYSTEM,
      scoringUserPrompt(reformulation.title, reformulation.description)
    ),
    chatCompletion(
      SWOT_SYSTEM,
      swotUserPrompt(reformulation.title, reformulation.description)
    ),
    chatCompletion(
      BUSINESS_MODEL_SYSTEM,
      businessModelUserPrompt(reformulation.title, reformulation.description)
    ),
  ]);

  const scores: ScoreResult = JSON.parse(scoresRaw);
  const swot: SwotResult = JSON.parse(swotRaw);
  const business_model: BusinessModelResult = JSON.parse(businessModelRaw);

  // Step 6: Action plan (uses previous results as context)
  const actionPlanRaw = await chatCompletion(
    ACTION_PLAN_SYSTEM,
    actionPlanUserPrompt(
      reformulation.title,
      reformulation.description,
      JSON.stringify(scores, null, 2),
      JSON.stringify(swot, null, 2),
      JSON.stringify(business_model, null, 2)
    )
  );
  const action_plan: ActionPlanResult = JSON.parse(actionPlanRaw);

  // Step 7: Connection discovery
  let connections: ConnectionResult[] = [];
  if (ctx.existingEntities.length > 0) {
    const connectionsRaw = await chatCompletion(
      CONNECTIONS_SYSTEM,
      connectionsUserPrompt(
        {
          type: 'idea',
          title: reformulation.title,
          description: reformulation.description,
        },
        ctx.existingEntities
      )
    );
    const parsed = JSON.parse(connectionsRaw);
    connections = parsed.connections || [];
  }

  return {
    reformulation,
    taxonomy,
    scores,
    swot,
    business_model,
    action_plan,
    connections,
  };
}
