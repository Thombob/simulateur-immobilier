'use client';

import { Shield, TrendingUp, AlertTriangle, Target, Users, Zap } from 'lucide-react';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { FullAnalysisResult } from '@/types/ai';

interface IdeaAnalysisProps {
  analysis: FullAnalysisResult;
}

export function IdeaAnalysis({ analysis }: IdeaAnalysisProps) {
  const { swot, business_model, action_plan } = analysis;

  return (
    <div className="space-y-6">
      {/* SWOT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-emerald-200 dark:border-emerald-800/30">
          <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <TrendingUp className="h-4 w-4" /> Forces
          </CardTitle>
          <CardContent>
            <ul className="mt-3 space-y-1.5">
              {swot.strengths.map((s, i) => (
                <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 flex gap-2">
                  <span className="text-emerald-500 shrink-0">+</span> {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-800/30">
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertTriangle className="h-4 w-4" /> Faiblesses
          </CardTitle>
          <CardContent>
            <ul className="mt-3 space-y-1.5">
              {swot.weaknesses.map((w, i) => (
                <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 flex gap-2">
                  <span className="text-red-500 shrink-0">-</span> {w}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800/30">
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <Target className="h-4 w-4" /> Opportunites
          </CardTitle>
          <CardContent>
            <ul className="mt-3 space-y-1.5">
              {swot.opportunities.map((o, i) => (
                <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 flex gap-2">
                  <span className="text-blue-500 shrink-0">*</span> {o}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-800/30">
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <Shield className="h-4 w-4" /> Menaces
          </CardTitle>
          <CardContent>
            <ul className="mt-3 space-y-1.5">
              {swot.threats.map((t, i) => (
                <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 flex gap-2">
                  <span className="text-amber-500 shrink-0">!</span> {t}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Business Model */}
      <Card>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-violet-500" /> Modele Economique
        </CardTitle>
        <CardContent>
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="info">{business_model.model_type}</Badge>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{business_model.description}</p>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
                Sources de revenus
              </p>
              <div className="flex flex-wrap gap-1.5">
                {business_model.revenue_streams.map((r, i) => (
                  <Badge key={i} variant="outline">{r}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
                Marche cible
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{business_model.target_market}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competitors */}
      {swot.competitors.length > 0 && (
        <Card>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-orange-500" /> Concurrents
          </CardTitle>
          <CardContent>
            <div className="mt-3 space-y-3">
              {swot.competitors.map((c, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                  <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 text-xs font-bold shrink-0">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{c.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{c.description}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Position : {c.market_position}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Plan */}
      <Card>
        <CardTitle>Plan d'Action</CardTitle>
        <CardContent>
          <div className="mt-3 space-y-4">
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Objectif</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{action_plan.objective}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                Prochaines actions immediates
              </p>
              <ul className="space-y-1.5">
                {action_plan.next_actions.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="h-5 w-5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-xs shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-zinc-600 dark:text-zinc-400">{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                  Sprint 30 jours
                </p>
                <ul className="space-y-1">
                  {action_plan.sprint_30_days.map((s, i) => (
                    <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 flex gap-2">
                      <span className="text-zinc-400">-</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                  Sprint 90 jours
                </p>
                <ul className="space-y-1">
                  {action_plan.sprint_90_days.map((s, i) => (
                    <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 flex gap-2">
                      <span className="text-zinc-400">-</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
