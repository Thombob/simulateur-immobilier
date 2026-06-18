'use client';

import { useState, useEffect } from 'react';
import { Rocket, CheckCircle2, Circle, Calendar, Target } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Project, Task } from '@/types/database';

export default function ExecutionPage() {
  const [projects, setProjects] = useState<(Project & { tasks?: Task[] })[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'timeline'>('overview');

  useEffect(() => {
    Promise.all([
      fetch('/api/projects').then((r) => r.json()),
      fetch('/api/tasks').then((r) => r.json()),
    ])
      .then(([projectsData, tasksData]) => {
        setProjects(projectsData);
        setTasks(tasksData);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeProjects = projects.filter((p) => p.status === 'in_progress');
  const pendingTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const completedToday = tasks.filter(
    (t) => t.status === 'done' && t.updated_at &&
    new Date(t.updated_at).toDateString() === new Date().toDateString()
  );

  async function toggleTask(taskId: string, currentStatus: string) {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setTasks((prev) =>
      prev.map((t) => t.id === taskId ? { ...t, status: newStatus as Task['status'] } : t)
    );
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Execution" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Execution"
        description="Transforme tes idees en resultats concrets"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Projets actifs</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{activeProjects.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">A faire</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{pendingTasks.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">En cours</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{inProgressTasks.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Fait aujourd'hui</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{completedToday.length}</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-zinc-200 dark:border-zinc-800">
        {[
          { key: 'overview', label: 'Vue d\'ensemble' },
          { key: 'tasks', label: 'Actions prioritaires' },
          { key: 'timeline', label: 'Timeline' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? 'border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {activeProjects.length === 0 ? (
            <Card className="text-center py-12">
              <Rocket className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
              <p className="text-zinc-500">Aucun projet actif</p>
            </Card>
          ) : (
            activeProjects.map((project) => {
              const projectTasks = tasks.filter((t) => t.project_id === project.id);
              const done = projectTasks.filter((t) => t.status === 'done').length;
              const total = projectTasks.length;
              const progress = total > 0 ? Math.round((done / total) * 100) : 0;

              return (
                <Card key={project.id}>
                  <div className="flex items-center justify-between mb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      {project.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-500">{progress}%</span>
                      <Badge variant={project.priority === 'urgent' ? 'danger' : project.priority === 'high' ? 'warning' : 'default'}>
                        {project.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  {project.objective && (
                    <p className="text-xs text-zinc-500 mb-3">{project.objective}</p>
                  )}
                  <ul className="space-y-1">
                    {projectTasks.filter((t) => t.status !== 'done').slice(0, 5).map((task) => (
                      <li key={task.id} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <Circle className="h-4 w-4 text-zinc-300 shrink-0" />
                        {task.title}
                      </li>
                    ))}
                  </ul>
                  {project.deadline && (
                    <div className="flex items-center gap-1 mt-3 text-xs text-zinc-400">
                      <Calendar className="h-3 w-3" />
                      Deadline: {new Date(project.deadline).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">
            Actions prioritaires ({pendingTasks.length + inProgressTasks.length})
          </h3>
          {[...inProgressTasks, ...pendingTasks].map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
            >
              <button onClick={() => toggleTask(task.id, task.status)} className="shrink-0">
                {task.status === 'done' ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Circle className="h-5 w-5 text-zinc-300 group-hover:text-zinc-400" />
                )}
              </button>
              <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">{task.title}</span>
              <Badge variant={task.status === 'in_progress' ? 'info' : 'default'}>
                {task.status === 'in_progress' ? 'En cours' : 'A faire'}
              </Badge>
              <Badge variant={task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : 'default'}>
                {task.priority}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="space-y-4">
          {projects.filter((p) => p.deadline).map((project) => {
            const daysLeft = Math.ceil(
              (new Date(project.deadline!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            return (
              <Card key={project.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{project.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {new Date(project.created_at).toLocaleDateString('fr-FR')} → {new Date(project.deadline!).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <Badge variant={daysLeft < 0 ? 'danger' : daysLeft < 7 ? 'warning' : 'default'}>
                    {daysLeft < 0 ? `${Math.abs(daysLeft)}j en retard` : `${daysLeft}j restants`}
                  </Badge>
                </div>
              </Card>
            );
          })}
          {projects.filter((p) => p.deadline).length === 0 && (
            <Card className="text-center py-12">
              <Calendar className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
              <p className="text-zinc-500">Aucun projet avec deadline</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
