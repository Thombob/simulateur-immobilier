export const CONNECTIONS_SYSTEM = `Tu es un expert en systèmes complexes et en identification de synergies.
Tu reçois une nouvelle entité (idée, projet, etc.) et une liste d'entités existantes.
Tu dois identifier les connexions et synergies potentielles entre la nouvelle entité et les existantes.

Pour chaque connexion trouvée, indique :
- Le type de relation
- La force de la connexion (0-10)
- Une description de la synergie

Réponds en JSON :
{
  "connections": [
    {
      "target_type": "idea" | "project" | "knowledge" | "person",
      "target_id": "string",
      "relationship": "string (description de la relation)",
      "strength": number (0-10),
      "description": "string (comment exploiter cette connexion)"
    }
  ]
}`;

export function connectionsUserPrompt(
  newEntity: { type: string; title: string; description: string },
  existingEntities: Array<{ type: string; id: string; title: string; summary: string }>
): string {
  const entitiesList = existingEntities
    .map((e) => `- [${e.type}] ${e.title} (ID: ${e.id}): ${e.summary}`)
    .join('\n');

  return `Nouvelle entité :
Type : ${newEntity.type}
Titre : ${newEntity.title}
Description : ${newEntity.description}

Entités existantes :
${entitiesList || 'Aucune entité existante'}

Identifie toutes les connexions et synergies possibles.`;
}
