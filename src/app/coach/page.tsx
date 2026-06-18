'use client';

import { useState, useEffect } from 'react';
import { Swords, AlertTriangle, Shield, Lightbulb, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CoachResult } from '@/types/ai';

interface IdeaSummary {
  id: string;
  title: string;
}

const severityVariants: Record<string, 'default' | 'warning' | 'danger'> = {
  low: 'default',
  medium: 'warning',
  high: 'danger',
  critical: 'danger',
};

export default function CoachPage() {
  const [ideas, setIdeas] = useState<IdeaSummary[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<string>('');
  const [result, setResult] = useState<CoachResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/ideas?status=scored')
      .then((r) => r.json())
      .then((data) => {
        setIdeas(data);
        if (data.length > 0) setSelectedIdea(data[0].id);
      });
  }, []);

  async function runCoach() {
    if (!selectedIdea) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/ai/coach', {
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
        title="Mode Coach"
        description="Challenge tes idees sans complaisance"
      />

      <Card className="mb-6">
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5">
                Selectionne une idee a challenger
              </label>
              <select
                value={selectedIdea}
                onChange={(e) => setSelectedIdea(e.target.value)}
                className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm outline-none"
              >
                {ideas.map((idea) => (
                  <option key={idea.id} value={idea.id}>{idea.title}</option>
                ))}
              </select>
            </div>
            <Button onClick={runCoach} loading={loading} disabled={!selectedIdea}>
              <Swords className="h-4 w-4" />
              Challenger
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 text-red-500 animate-spin mb-4" />
          <p className="text-sm text-zinc-500">Le coach analyse les failles...</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Overall Assessment */}
          <Card className="border-zinc-300 dark:border-zinc-600">
            <CardTitle>Evaluation globale</CardTitle>
            <CardContent>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {result.overall_assessment}
              </p>
            </CardContent>
          </Card>

          {/* Hypotheses */}
          {result.hypotheses.length > 0 && (
            <Card>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Hypotheses non verifiees ({result.hypotheses.length})
              </CardTitle>
              <CardContent>
                <div className="mt-3 space-y-3">
                  {result.hypotheses.map((h, i) => (
                    <div key={i} className="p-4 rounded-lg border border-amber-200 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-900/10">
                      <div className="flex items-start gap-2 mb-2">
                        <Badge variant={severityVariants[h.severity]}>{h.severity}</Badge>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{h.statement}</p>
                      </div>
                      <p className="text-xs text-zinc-500 mb-2">{h.explanation}</p>
                      <div className="flex gap-1 items-start">
                        <span className="text-xs text-emerald-600 font-medium shrink-0">Mitigation:</span>
                        <span className="text-xs text-emerald-600">{h.mitigation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risks */}
          {result.risks.length > 0 && (
            <Card>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-500" />
                Risques majeurs ({result.risks.length})
              </CardTitle>
              <CardContent>
                <div className="mt-3 space-y-3">
                  {result.risks.map((r, i) => (
                    <div key={i} className="p-4 rounded-lg border border-red-200 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/10">
                      <div className="flex items-start gap-2 mb-2">
                        <Badge variant={severityVariants[r.severity]}>{r.severity}</Badge>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{r.statement}</p>
                      </div>
                      <p className="text-xs text-zinc-500 mb-2">{r.explanation}</p>
                      <div className="flex gap-1 items-start">
                        <span className="text-xs text-emerald-600 font-medium shrink-0">Mitigation:</span>
                        <span className="text-xs text-emerald-600">{r.mitigation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weaknesses */}
          {result.weaknesses.length > 0 && (
            <Card>
              <CardTitle>Points faibles ({result.weaknesses.length})</CardTitle>
              <CardContent>
                <div className="mt-3 space-y-2">
                  {result.weaknesses.map((w, i) => (
                    <div key={i} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                      <div className="flex items-start gap-2 mb-1">
                        <Badge variant={severityVariants[w.severity]}>{w.severity}</Badge>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300">{w.statement}</p>
                      </div>
                      <p className="text-xs text-zinc-400">{w.mitigation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alternatives */}
          {result.alternatives.length > 0 && (
            <Card>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-blue-500" />
                Alternatives proposees ({result.alternatives.length})
              </CardTitle>
              <CardContent>
                <div className="mt-3 space-y-4">
                  {result.alternatives.map((alt, i) => (
                    <div key={i} className="p-4 rounded-lg border border-blue-200 dark:border-blue-800/30 bg-blue-50/50 dark:bg-blue-900/10">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{alt.title}</p>
                      <p className="text-xs text-zinc-500 mb-3">{alt.description}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-emerald-600 mb-1">Avantages</p>
                          {alt.advantages.map((a, j) => (
                            <p key={j} className="text-xs text-zinc-500">+ {a}</p>
                          ))}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-red-500 mb-1">Inconvenients</p>
                          {alt.disadvantages.map((d, j) => (
                            <p key={j} className="text-xs text-zinc-500">- {d}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!result && !loading && (
        <div className="text-center py-16">
          <Swords className="h-12 w-12 text-zinc-200 dark:text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500">Selectionne une idee pour la soumettre au Coach</p>
        </div>
      )}
    </div>
  );
}
