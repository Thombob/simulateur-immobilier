'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Lightbulb,
  FolderKanban,
  CheckSquare,
  TrendingUp,
  ArrowRight,
  Mic,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DashboardStats {
  ideas: number;
  projects: number;
  tasks: number;
  avgScore: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({ ideas: 0, projects: 0, tasks: 0, avgScore: 0 });
  const [recentIdeas, setRecentIdeas] = useState<Array<{ id: string; title: string; status: string; score?: { global_score: number } }>>([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [ideasRes, projectsRes, tasksRes] = await Promise.all([
          fetch('/api/ideas?limit=5'),
          fetch('/api/projects'),
          fetch('/api/tasks?status=todo'),
        ]);

        const ideas = ideasRes.ok ? await ideasRes.json() : [];
        const projects = projectsRes.ok ? await projectsRes.json() : [];
        const tasks = tasksRes.ok ? await tasksRes.json() : [];

        const scores = ideas
          .filter((i: { score?: { global_score: number } }) => i.score?.global_score)
          .map((i: { score: { global_score: number } }) => i.score.global_score);
        const avgScore = scores.length > 0
          ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
          : 0;

        setStats({
          ideas: ideas.length,
          projects: projects.length,
          tasks: tasks.length,
          avgScore,
        });
        setRecentIdeas(ideas.slice(0, 5));
      } catch {
        // Dashboard loads gracefully with defaults
      }
    }
    loadDashboard();
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Vue d'ensemble de ton Life OS"
        actions={
          <Link href="/capture">
            <Button>
              <Mic className="h-4 w-4" />
              Capturer une idee
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.ideas}</p>
              <p className="text-xs text-zinc-500">Idees</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FolderKanban className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.projects}</p>
              <p className="text-xs text-zinc-500">Projets</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <CheckSquare className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.tasks}</p>
              <p className="text-xs text-zinc-500">Taches</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {stats.avgScore > 0 ? stats.avgScore.toFixed(1) : '-'}
              </p>
              <p className="text-xs text-zinc-500">Score moyen</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Ideas */}
        <Card>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-500" />
              Idees recentes
            </span>
            <Link href="/ideas" className="text-sm text-zinc-500 hover:text-zinc-700 flex items-center gap-1">
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          </CardTitle>
          <CardContent>
            {recentIdeas.length === 0 ? (
              <div className="text-center py-8">
                <Lightbulb className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
                <p className="text-sm text-zinc-500">Aucune idee pour l'instant</p>
                <Link href="/capture" className="text-sm text-zinc-900 dark:text-zinc-100 font-medium hover:underline mt-1 inline-block">
                  Capture ta premiere idee
                </Link>
              </div>
            ) : (
              <ul className="mt-3 space-y-2">
                {recentIdeas.map((idea) => (
                  <li key={idea.id}>
                    <Link
                      href={`/ideas/${idea.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge variant={idea.status === 'scored' ? 'success' : 'default'} className="shrink-0">
                          {idea.status}
                        </Badge>
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {idea.title}
                        </span>
                      </div>
                      {idea.score && (
                        <span className="text-sm font-bold text-emerald-600 shrink-0 ml-2">
                          {idea.score.global_score.toFixed(1)}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardTitle>Actions rapides</CardTitle>
          <CardContent>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <Link href="/capture">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all cursor-pointer">
                  <div className="h-8 w-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center">
                    <Mic className="h-4 w-4 text-white dark:text-zinc-900" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Capturer une idee</p>
                    <p className="text-xs text-zinc-500">Texte ou voix</p>
                  </div>
                </div>
              </Link>
              <Link href="/projects">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all cursor-pointer">
                  <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
                    <FolderKanban className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Creer un projet</p>
                    <p className="text-xs text-zinc-500">Transformer une idee en action</p>
                  </div>
                </div>
              </Link>
              <Link href="/tasks">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all cursor-pointer">
                  <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center">
                    <CheckSquare className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Ajouter une tache</p>
                    <p className="text-xs text-zinc-500">Prochaine action concrete</p>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
