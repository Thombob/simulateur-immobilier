import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: connections, error } = await supabase
    .from('connections')
    .select('*')
    .eq('user_id', user.id)
    .order('strength', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enrich with entity names
  const enriched = await Promise.all(
    (connections || []).map(async (conn) => {
      const [sourceName, targetName] = await Promise.all([
        getEntityName(supabase, conn.source_type, conn.source_id),
        getEntityName(supabase, conn.target_type, conn.target_id),
      ]);
      return { ...conn, source_name: sourceName, target_name: targetName };
    })
  );

  return NextResponse.json(enriched);
}

async function getEntityName(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  type: string,
  id: string
): Promise<string> {
  const tableMap: Record<string, { table: string; field: string }> = {
    idea: { table: 'ideas', field: 'title' },
    project: { table: 'projects', field: 'name' },
    knowledge: { table: 'knowledge', field: 'subject' },
    person: { table: 'people', field: 'name' },
  };

  const mapping = tableMap[type];
  if (!mapping) return id;

  const { data } = await supabase
    .from(mapping.table)
    .select(mapping.field)
    .eq('id', id)
    .single();

  return (data as Record<string, string> | null)?.[mapping.field] || id;
}
