import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { runAnalysisPipeline } from '@/lib/ai/pipeline';

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { idea_id } = await request.json();
  if (!idea_id) {
    return NextResponse.json({ error: 'idea_id is required' }, { status: 400 });
  }

  // Fetch the idea
  const { data: idea, error: ideaError } = await supabase
    .from('ideas')
    .select('*')
    .eq('id', idea_id)
    .eq('user_id', user.id)
    .single();

  if (ideaError || !idea) {
    return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
  }

  // Update status to analyzing
  await supabase.from('ideas').update({ status: 'analyzing' }).eq('id', idea_id);

  try {
    // Fetch existing categories for taxonomy
    const { data: categories } = await supabase
      .from('categories')
      .select('name')
      .eq('user_id', user.id);

    // Fetch existing entities for connection discovery
    const { data: existingIdeas } = await supabase
      .from('ideas')
      .select('id, title, summary')
      .eq('user_id', user.id)
      .neq('id', idea_id)
      .limit(50);

    const { data: existingProjects } = await supabase
      .from('projects')
      .select('id, name, description')
      .eq('user_id', user.id)
      .limit(50);

    const existingEntities = [
      ...(existingIdeas || []).map((e) => ({
        type: 'idea',
        id: e.id,
        title: e.title,
        summary: e.summary || '',
      })),
      ...(existingProjects || []).map((e) => ({
        type: 'project',
        id: e.id,
        title: e.name,
        summary: e.description || '',
      })),
    ];

    // Run the analysis pipeline
    const result = await runAnalysisPipeline({
      rawInput: idea.raw_input,
      existingCategories: (categories || []).map((c) => c.name),
      existingEntities,
    });

    // Create/find category
    let categoryId = null;
    if (result.taxonomy.category) {
      const slug = result.taxonomy.category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .eq('slug', slug)
        .single();

      if (existing) {
        categoryId = existing.id;
      } else {
        const { data: newCat } = await supabase
          .from('categories')
          .insert({
            user_id: user.id,
            name: result.taxonomy.category,
            slug,
            is_auto_created: true,
          })
          .select('id')
          .single();
        categoryId = newCat?.id;
      }
    }

    // Create subcategory if needed
    let subcategoryId = null;
    if (result.taxonomy.subcategory && categoryId) {
      const slug = result.taxonomy.subcategory.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .eq('slug', slug)
        .single();

      if (existing) {
        subcategoryId = existing.id;
      } else {
        const { data: newCat } = await supabase
          .from('categories')
          .insert({
            user_id: user.id,
            name: result.taxonomy.subcategory,
            slug,
            parent_id: categoryId,
            is_auto_created: true,
          })
          .select('id')
          .single();
        subcategoryId = newCat?.id;
      }
    }

    // Update the idea with analysis results
    await supabase
      .from('ideas')
      .update({
        title: result.reformulation.title,
        summary: result.reformulation.summary,
        description: result.reformulation.description,
        category_id: categoryId,
        subcategory_id: subcategoryId,
        status: 'scored',
        business_model: result.business_model,
        swot: result.swot,
        competitors: result.swot.competitors,
        risks: result.swot,
        required_skills: result.business_model.key_resources,
        next_actions: result.action_plan.next_actions,
        execution_plan: result.action_plan,
        ai_analysis: result,
      })
      .eq('id', idea_id);

    // Insert scores
    await supabase.from('idea_scores').insert({
      idea_id,
      user_id: user.id,
      economic_potential: result.scores.economic_potential.score,
      execution_ease: result.scores.execution_ease.score,
      capital_required: result.scores.capital_required.score,
      time_required: result.scores.time_required.score,
      scalability: result.scores.scalability.score,
      skill_compatibility: result.scores.skill_compatibility.score,
      success_probability: result.scores.success_probability.score,
      global_score: result.scores.global_score,
      recommended_priority: result.scores.recommended_priority,
      ai_reasoning: {
        economic_potential: result.scores.economic_potential.reasoning,
        execution_ease: result.scores.execution_ease.reasoning,
        capital_required: result.scores.capital_required.reasoning,
        time_required: result.scores.time_required.reasoning,
        scalability: result.scores.scalability.reasoning,
        skill_compatibility: result.scores.skill_compatibility.reasoning,
        success_probability: result.scores.success_probability.reasoning,
      },
    });

    // Insert connections
    for (const conn of result.connections) {
      await supabase.from('connections').insert({
        user_id: user.id,
        source_type: 'idea',
        source_id: idea_id,
        target_type: conn.target_type,
        target_id: conn.target_id,
        relationship: conn.relationship,
        strength: conn.strength,
        ai_generated: true,
      });
    }

    // Create tags
    for (const tagName of result.taxonomy.tags) {
      const slug = tagName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const { data: existingTag } = await supabase
        .from('tags')
        .select('id')
        .eq('user_id', user.id)
        .eq('slug', slug)
        .single();

      let tagId: string;
      if (existingTag) {
        tagId = existingTag.id;
      } else {
        const { data: newTag } = await supabase
          .from('tags')
          .insert({
            user_id: user.id,
            name: tagName,
            slug,
            is_auto_created: true,
          })
          .select('id')
          .single();
        if (!newTag) continue;
        tagId = newTag.id;
      }

      await supabase
        .from('idea_tags')
        .upsert({ idea_id, tag_id: tagId });
    }

    return NextResponse.json({
      success: true,
      analysis: result,
    });
  } catch (error) {
    await supabase.from('ideas').update({ status: 'draft' }).eq('id', idea_id);
    const message = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
