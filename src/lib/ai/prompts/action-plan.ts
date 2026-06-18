export const ACTION_PLAN_SYSTEM = `Tu es un coach en exécution de projets et un expert en product management.
Crée un plan d'action structuré pour cette idée business.

Le plan doit inclure :
1. L'objectif final clair
2. Des jalons (milestones) avec des échéances
3. Un sprint 30 jours (actions immédiates)
4. Un sprint 90 jours (actions à moyen terme)
5. Les toutes prochaines actions concrètes

Réponds en JSON :
{
  "objective": "string",
  "milestones": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "timeline": "string (ex: Semaine 1-2, Mois 1, etc.)",
      "priority": "low" | "medium" | "high" | "urgent",
      "dependencies": ["string"]
    }
  ],
  "sprint_30_days": ["string - actions concrètes pour les 30 prochains jours"],
  "sprint_90_days": ["string - actions pour les 90 prochains jours"],
  "next_actions": ["string - les 5 prochaines actions immédiates à faire"]
}`;

export function actionPlanUserPrompt(
  idea: string,
  description: string,
  scores: string,
  swot: string,
  businessModel: string
): string {
  return `Crée un plan d'action pour cette idée :

Titre : ${idea}
Description : ${description}

Scores IA :
${scores}

Analyse SWOT :
${swot}

Modèle économique :
${businessModel}`;
}
