import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { chatCompletion } from '@/lib/ai/openai';
import { MENTOR_SYSTEM, mentorUserPrompt } from '@/lib/ai/prompts/mentor';

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { idea_id } = await request.json();

  const { data: idea, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('id', idea_id)
    .eq('user_id', user.id)
    .single();

  if (error || !idea) {
    return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
  }

  try {
    const resultRaw = await chatCompletion(
      MENTOR_SYSTEM,
      mentorUserPrompt(idea.title, idea.description || idea.raw_input)
    );
    const result = JSON.parse(resultRaw);

    // Store learning plan in knowledge base
    for (const gap of result.knowledge_gaps || []) {
      await supabase.from('knowledge').insert({
        user_id: user.id,
        subject: gap.topic,
        summary: `Gap identifie pour: ${idea.title}`,
        level: gap.current_level || 'beginner',
        learning_plan: result.learning_plan,
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Mentor analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
