'use client';

import { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Target, Users, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MentorResult } from '@/types/ai';

interface IdeaSummary {
  id: string;
  title: string;
  status: string;
}

export default function MentorPage() {
  const [ideas, setIdeas] = useState<IdeaSummary[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<string>('');
  const [result, setResult] = useState<MentorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [ideasLoading, setIdeasLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ideas?status=scored')
      .then((r) => r.json())
      .then((data) => {
        setIdeas(data);
        if (data.length > 0) setSelectedIdea(data[0].id);
      })
      .finally(() => setIdeasLoading(false));
  }, []);

  async function runMentor() {
    if (!selectedIdea) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/ai/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea_id: selectedIdea }),
      });
      if (res.ok) setResult(await res.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Mode Mentor"
        description="Identifie tes lacunes et construis ton parcours d'apprentissage"
      />

      {/* Idea selector */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5">
                Selectionne une idee a analyser
              </label>
              <select
                value={selectedIdea}
                onChange={(e) => setSelectedIdea(e.target.value)}
                className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm outline-none"
                disabled={ideasLoading}
              >
                {ideas.map((idea) => (
                  <option key={idea.id} value={idea.id}>{idea.title}</option>
                ))}
                {ideas.length === 0 && <option>Aucune idee analysee</option>}
              </select>
            </div>
            <Button onClick={runMentor} loading={loading} disabled={!selectedIdea || ideasLoading}>
              <GraduationCap className="h-4 w-4" />
              Analyser
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 text-violet-500 animate-spin mb-4" />
          <p className="text-sm text-zinc-500">Le mentor analyse tes besoins...</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Knowledge Gaps */}
          <Card>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-red-500" />
              Connaissances manquantes ({result.knowledge_gaps.length})
            </CardTitle>
            <CardContent>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.knowledge_gaps.map((gap, i) => (
                  <div key={i} className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{gap.topic}</span>
                      <Badge variant={gap.importance >= 8 ? 'danger' : gap.importance >= 5 ? 'warning' : 'default'}>
                        {gap.importance}/10
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">{gap.current_level}</span>
                      <span>→</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                        {gap.target_level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Learning Plan */}
          <Card>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-violet-500" />
              Parcours d'apprentissage
            </CardTitle>
            <CardContent>
              <div className="mt-3 relative">
                <div className="absolute left-3 top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-700" />
                <div className="space-y-4">
                  {result.learning_plan.map((step) => (
                    <div key={step.order} className="flex gap-4 relative">
                      <div className="h-7 w-7 rounded-full bg-violet-500 text-white flex items-center justify-center text-xs font-bold shrink-0 z-10">
                        {step.order}
                      </div>
                      <div className="pb-2">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{step.topic}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{step.description}</p>
                        <Badge variant="outline" className="mt-2">{step.duration}</Badge>
                        {step.resources.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {step.resources.map((r, j) => (
                              <li key={j} className="text-xs text-zinc-400 flex gap-1">
                                <span>-</span> {r}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Books */}
          <Card>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-amber-500" />
              Livres recommandes ({result.recommended_books.length})
            </CardTitle>
            <CardContent>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.recommended_books.map((book, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <div className="h-14 w-10 rounded bg-gradient-to-b from-amber-200 to-amber-300 dark:from-amber-800 dark:to-amber-900 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{book.title}</p>
                      <p className="text-xs text-zinc-500">{book.author}</p>
                      <p className="text-xs text-zinc-400 mt-1">{book.relevance}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          {result.recommended_resources.length > 0 && (
            <Card>
              <CardTitle>Ressources recommandees</CardTitle>
              <CardContent>
                <div className="mt-3 space-y-2">
                  {result.recommended_resources.map((resource, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <Badge variant="info">{resource.type}</Badge>
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{resource.title}</p>
                        <p className="text-xs text-zinc-500">{resource.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experts */}
          {result.recommended_experts.length > 0 && (
            <Card>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Experts a suivre
              </CardTitle>
              <CardContent>
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.recommended_experts.map((expert, i) => (
                    <Badge key={i} variant="outline">{expert}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!result && !loading && (
        <div className="text-center py-16">
          <GraduationCap className="h-12 w-12 text-zinc-200 dark:text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500">Selectionne une idee et lance l'analyse pour decouvrir ton parcours d'apprentissage</p>
        </div>
      )}
    </div>
  );
}
