'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  GraduationCap,
  Swords,
  Trash2,
  Loader2,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { IdeaScoreRadar } from '@/components/ideas/idea-score-radar';
import { IdeaAnalysis } from '@/components/ideas/idea-analysis';
import type { Idea } from '@/types/database';
import type { FullAnalysisResult, MentorResult, CoachResult } from '@/types/ai';

export default function IdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'mentor' | 'coach'>('overview');
  const [reanalyzing, setReanalyzing] = useState(false);
  const [mentorResult, setMentorResult] = useState<MentorResult | null>(null);
  const [coachResult, setCoachResult] = useState<CoachResult | null>(null);
  const [mentorLoading, setMentorLoading] = useState(false);
  const [coachLoading, setCoachLoading] = useState(false);

  useEffect(() => {
    async function fetchIdea() {
      try {
        const res = await fetch(`/api/ideas/${id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setIdea(data);
      } catch {
        router.push('/ideas');
      } finally {
        setLoading(false);
      }
    }
    fetchIdea();
  }, [id, router]);

  async function handleReanalyze() {
    if (!idea) return;
    setReanalyzing(true);
    try {
      await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea_id: idea.id }),
      });
      const res = await fetch(`/api/ideas/${id}`);
      const data = await res.json();
      setIdea(data);
    } finally {
      setReanalyzing(false);
    }
  }

  async function handleMentor() {
    if (!idea) return;
    setMentorLoading(true);
    try {
      const res = await fetch('/api/ai/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea_id: idea.id }),
      });
      const data = await res.json();
      setMentorResult(data);
      setActiveTab('mentor');
    } finally {
      setMentorLoading(false);
    }
  }

  async function handleCoach() {
    if (!idea) return;
    setCoachLoading(true);
    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea_id: idea.id }),
      });
      const data = await res.json();
      setCoachResult(data);
      setActiveTab('coach');
    } finally {
      setCoachLoading(false);
    }
  }

  async function handleDelete() {
    if (!idea || !confirm('Supprimer cette idee ?')) return;
    await fetch(`/api/ideas/${idea.id}`, { method: 'DELETE' });
    router.push('/ideas');
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!idea) return null;

  const analysis = idea.ai_analysis as FullAnalysisResult | null;

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => router.push('/ideas')}
          className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Ideas
        </button>
        <PageHeader
          title={idea.title}
          description={idea.summary || idea.raw_input}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleMentor} loading={mentorLoading} size="sm">
                <GraduationCap className="h-4 w-4" /> Mentor
              </Button>
              <Button variant="outline" onClick={handleCoach} loading={coachLoading} size="sm">
                <Swords className="h-4 w-4" /> Coach
              </Button>
              <Button variant="outline" onClick={handleReanalyze} loading={reanalyzing} size="sm">
                <Sparkles className="h-4 w-4" /> Re-analyser
              </Button>
              <Button variant="danger" onClick={handleDelete} size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          }
        />
      </div>

      {/* Status & Meta */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge variant={idea.status === 'scored' ? 'success' : idea.status === 'analyzing' ? 'info' : 'default'}>
          {idea.status}
        </Badge>
        {idea.category && <Badge variant="outline">{idea.category.name}</Badge>}
        {idea.tags.map((tag) => (
          <Badge key={tag} variant="default">{tag}</Badge>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-zinc-200 dark:border-zinc-800">
        {[
          { key: 'overview', label: 'Vue d\'ensemble' },
          { key: 'analysis', label: 'Analyse IA' },
          { key: 'mentor', label: 'Mentor' },
          { key: 'coach', label: 'Coach' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? 'border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardTitle>Description</CardTitle>
              <CardContent>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                  {idea.description || idea.raw_input}
                </p>
              </CardContent>
            </Card>

            {idea.next_actions && idea.next_actions.length > 0 && (
              <Card>
                <CardTitle>Prochaines actions</CardTitle>
                <CardContent>
                  <ul className="mt-2 space-y-2">
                    {idea.next_actions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <span className="h-5 w-5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-xs shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            {idea.score && <IdeaScoreRadar score={idea.score} />}
          </div>
        </div>
      )}

      {activeTab === 'analysis' && analysis && <IdeaAnalysis analysis={analysis} />}

      {activeTab === 'analysis' && !analysis && (
        <Card className="text-center py-12">
          <Sparkles className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-500 mb-4">Aucune analyse disponible</p>
          <Button onClick={handleReanalyze} loading={reanalyzing}>
            Lancer l'analyse IA
          </Button>
        </Card>
      )}

      {activeTab === 'mentor' && mentorResult && (
        <div className="space-y-6">
          {mentorResult.knowledge_gaps.length > 0 && (
            <Card>
              <CardTitle>Connaissances manquantes</CardTitle>
              <CardContent>
                <div className="mt-3 space-y-3">
                  {mentorResult.knowledge_gaps.map((gap, i) => (
                    <div key={i} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{gap.topic}</span>
                        <Badge variant="info">Importance: {gap.importance}/10</Badge>
                      </div>
                      <p className="text-xs text-zinc-500">
                        {gap.current_level} → {gap.target_level}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {mentorResult.recommended_books.length > 0 && (
            <Card>
              <CardTitle>Livres recommandes</CardTitle>
              <CardContent>
                <div className="mt-3 space-y-2">
                  {mentorResult.recommended_books.map((book, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                      <div className="h-10 w-7 rounded bg-violet-200 dark:bg-violet-800 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{book.title}</p>
                        <p className="text-xs text-zinc-500">{book.author}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{book.relevance}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {mentorResult.learning_plan.length > 0 && (
            <Card>
              <CardTitle>Parcours d'apprentissage</CardTitle>
              <CardContent>
                <div className="mt-3 space-y-3">
                  {mentorResult.learning_plan.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-6 w-6 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-xs font-bold">
                          {step.order}
                        </div>
                        {i < mentorResult.learning_plan.length - 1 && (
                          <div className="w-px h-full bg-zinc-200 dark:bg-zinc-700 mt-1" />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{step.topic}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{step.description}</p>
                        <Badge variant="outline" className="mt-1">{step.duration}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'mentor' && !mentorResult && (
        <Card className="text-center py-12">
          <GraduationCap className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-500 mb-4">Active le mode Mentor pour cette idee</p>
          <Button onClick={handleMentor} loading={mentorLoading}>
            <GraduationCap className="h-4 w-4" /> Activer le Mentor
          </Button>
        </Card>
      )}

      {activeTab === 'coach' && coachResult && (
        <div className="space-y-6">
          <Card>
            <CardTitle>Evaluation globale</CardTitle>
            <CardContent>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {coachResult.overall_assessment}
              </p>
            </CardContent>
          </Card>

          {coachResult.hypotheses.length > 0 && (
            <Card>
              <CardTitle>Hypotheses a verifier</CardTitle>
              <CardContent>
                <div className="mt-3 space-y-2">
                  {coachResult.hypotheses.map((h, i) => (
                    <div key={i} className="p-3 rounded-lg border border-amber-200 dark:border-amber-800/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={h.severity === 'critical' ? 'danger' : h.severity === 'high' ? 'warning' : 'default'}>
                          {h.severity}
                        </Badge>
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{h.statement}</span>
                      </div>
                      <p className="text-xs text-zinc-500">{h.explanation}</p>
                      <p className="text-xs text-emerald-600 mt-1">Mitigation: {h.mitigation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {coachResult.risks.length > 0 && (
            <Card>
              <CardTitle>Risques identifies</CardTitle>
              <CardContent>
                <div className="mt-3 space-y-2">
                  {coachResult.risks.map((r, i) => (
                    <div key={i} className="p-3 rounded-lg border border-red-200 dark:border-red-800/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={r.severity === 'critical' ? 'danger' : r.severity === 'high' ? 'warning' : 'default'}>
                          {r.severity}
                        </Badge>
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{r.statement}</span>
                      </div>
                      <p className="text-xs text-zinc-500">{r.explanation}</p>
                      <p className="text-xs text-emerald-600 mt-1">Mitigation: {r.mitigation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {coachResult.alternatives.length > 0 && (
            <Card>
              <CardTitle>Alternatives proposees</CardTitle>
              <CardContent>
                <div className="mt-3 space-y-3">
                  {coachResult.alternatives.map((alt, i) => (
                    <div key={i} className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{alt.title}</p>
                      <p className="text-xs text-zinc-500 mt-1">{alt.description}</p>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <div>
                          <p className="text-xs font-medium text-emerald-600 mb-1">Avantages</p>
                          {alt.advantages.map((a, j) => (
                            <p key={j} className="text-xs text-zinc-500">+ {a}</p>
                          ))}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-red-600 mb-1">Inconvenients</p>
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

      {activeTab === 'coach' && !coachResult && (
        <Card className="text-center py-12">
          <Swords className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-500 mb-4">Active le mode Coach pour challenger cette idee</p>
          <Button onClick={handleCoach} loading={coachLoading}>
            <Swords className="h-4 w-4" /> Activer le Coach
          </Button>
        </Card>
      )}
    </div>
  );
}
