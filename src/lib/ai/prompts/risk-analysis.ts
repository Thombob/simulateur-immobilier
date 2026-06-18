export const SWOT_SYSTEM = `Tu es un consultant stratégique senior. Analyse cette idée business selon la méthode SWOT.

Fournis également :
- Un résumé des risques principaux
- Une liste de concurrents potentiels avec leur position sur le marché

Réponds en JSON :
{
  "strengths": ["string"],
  "weaknesses": ["string"],
  "opportunities": ["string"],
  "threats": ["string"],
  "risk_summary": "string",
  "competitors": [
    {
      "name": "string",
      "url": "string ou null",
      "description": "string",
      "market_position": "string"
    }
  ]
}`;

export function swotUserPrompt(idea: string, description: string): string {
  return `Analyse SWOT pour cette idée :\n\nTitre : ${idea}\n\nDescription : ${description}`;
}

export const BUSINESS_MODEL_SYSTEM = `Tu es un expert en modèles économiques et stratégie business.
Identifie le modèle économique le plus adapté pour cette idée.

Réponds en JSON :
{
  "model_type": "string (ex: SaaS, Marketplace, Freemium, Commission, Abonnement, etc.)",
  "description": "string",
  "revenue_streams": ["string"],
  "target_market": "string",
  "value_proposition": "string",
  "key_resources": ["string"],
  "cost_structure": ["string"]
}`;

export function businessModelUserPrompt(idea: string, description: string): string {
  return `Identifie le modèle économique pour :\n\nTitre : ${idea}\n\nDescription : ${description}`;
}
