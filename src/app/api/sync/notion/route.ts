import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createNotionClient, syncIdeaToNotion } from '@/lib/notion/client';

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Get user's Notion token
  const { data: profile } = await supabase
    .from('profiles')
    .select('notion_token')
    .eq('id', user.id)
    .single();

  if (!profile?.notion_token) {
    return NextResponse.json(
      { error: 'Notion token not configured. Go to Settings to connect Notion.' },
      { status: 400 }
    );
  }

  const { parent_page_id, entities } = await request.json();

  if (!parent_page_id) {
    return NextResponse.json({ error: 'parent_page_id is required' }, { status: 400 });
  }

  const notion = createNotionClient(profile.notion_token);
  const entitiesToSync = entities || ['ideas'];
  const results: { entity: string; synced: number; errors: number }[] = [];

  for (const entity of entitiesToSync) {
    if (entity === 'ideas') {
      const { data: ideas } = await supabase
        .from('ideas')
        .select('*, category:categories!category_id(name)')
        .eq('user_id', user.id)
        .is('notion_page_id', null);

      let synced = 0;
      let errors = 0;

      for (const idea of ideas || []) {
        try {
          // Get score
          const { data: score } = await supabase
            .from('idea_scores')
            .select('global_score')
            .eq('idea_id', idea.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          const notionPageId = await syncIdeaToNotion(notion, parent_page_id, {
            title: idea.title,
            summary: idea.summary,
            status: idea.status,
            category: idea.category?.name,
            score: score?.global_score,
            tags: [],
          });

          await supabase
            .from('ideas')
            .update({ notion_page_id: notionPageId })
            .eq('id', idea.id);

          synced++;
        } catch {
          errors++;
        }
      }

      results.push({ entity: 'ideas', synced, errors });
    }
  }

  return NextResponse.json({ success: true, results });
}
