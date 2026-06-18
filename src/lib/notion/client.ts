import { Client } from '@notionhq/client';

export function createNotionClient(token: string) {
  return new Client({ auth: token });
}

export async function syncIdeaToNotion(
  notion: Client,
  parentPageId: string,
  idea: {
    title: string;
    summary: string | null;
    status: string;
    category?: string;
    score?: number;
    tags: string[];
  }
): Promise<string> {
  const response = await notion.pages.create({
    parent: { page_id: parentPageId },
    properties: {
      title: {
        title: [{ text: { content: idea.title } }],
      },
    },
    children: [
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: 'Resume' } }],
        },
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ text: { content: idea.summary || '' } }],
        },
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: 'Details' } }],
        },
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ text: { content: `Statut: ${idea.status}` } }],
        },
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ text: { content: `Categorie: ${idea.category || 'Non classee'}` } }],
        },
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ text: { content: `Score: ${idea.score?.toFixed(1) || 'Non evalue'}` } }],
        },
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ text: { content: `Tags: ${idea.tags.join(', ') || 'Aucun'}` } }],
        },
      },
    ],
  });

  return response.id;
}
