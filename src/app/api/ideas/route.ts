import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  let query = supabase
    .from('ideas')
    .select('*, category:categories!category_id(id, name, color, icon)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq('status', status);
  if (category) query = query.eq('category_id', category);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch scores for each idea
  const ideaIds = data.map((i: { id: string }) => i.id);
  const { data: scores } = await supabase
    .from('idea_scores')
    .select('*')
    .in('idea_id', ideaIds);

  const ideasWithScores = data.map((idea: Record<string, unknown>) => ({
    ...idea,
    score: scores?.find((s: { idea_id: string }) => s.idea_id === idea.id) || null,
  }));

  return NextResponse.json(ideasWithScores);
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, raw_input, source = 'text' } = body;

  if (!title || !raw_input) {
    return NextResponse.json({ error: 'Title and raw_input are required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('ideas')
    .insert({
      user_id: user.id,
      title,
      raw_input,
      source,
      status: 'draft',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
