import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { chatCompletion } from '@/lib/ai/openai';
import { COACH_SYSTEM, coachUserPrompt } from '@/lib/ai/prompts/coach';

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
      COACH_SYSTEM,
      coachUserPrompt(
        idea.title,
        idea.description || idea.raw_input,
        JSON.stringify(idea.ai_analysis || {})
      )
    );
    const result = JSON.parse(resultRaw);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Coach analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
