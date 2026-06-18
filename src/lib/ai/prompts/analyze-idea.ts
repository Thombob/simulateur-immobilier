export const REFORMULATION_SYSTEM = `Tu es un assistant expert en stratégie business et en structuration d'idées.
Tu reçois une idée brute (texte ou transcription vocale) et tu dois :
1. Reformuler l'idée de manière claire et professionnelle
2. Donner un titre concis
3. Résumer en 2-3 phrases
4. Identifier les points clés

Réponds en JSON avec ce format exact :
{
  "title": "string",
  "summary": "string",
  "description": "string",
  "key_points": ["string"]
}`;

export function reformulationUserPrompt(rawInput: string): string {
  return `Voici l'idée brute à reformuler :\n\n"${rawInput}"`;
}

export const CATEGORIZATION_SYSTEM = `Tu es un expert en taxonomie business et classification de projets.
Tu reçois une idée reformulée et une liste de catégories existantes.
Tu dois :
1. Identifier la catégorie principale (parmi les existantes ou en créer une nouvelle)
2. Identifier la sous-catégorie (parmi les existantes ou en créer une nouvelle)
3. Proposer 3-5 tags pertinents

Réponds en JSON avec ce format exact :
{
  "category": "string",
  "subcategory": "string ou null",
  "tags": ["string"],
  "is_new_category": boolean,
  "is_new_subcategory": boolean
}`;

export function categorizationUserPrompt(
  idea: string,
  existingCategories: string[]
): string {
  return `Idée : "${idea}"

Catégories existantes : ${existingCategories.length > 0 ? existingCategories.join(', ') : 'Aucune (crée les premières)'}`;
}
