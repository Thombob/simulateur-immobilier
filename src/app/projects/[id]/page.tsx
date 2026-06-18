'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  Target,
  Loader2,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Project, Task } from '@/types/database';

interface ProjectDetail extends Project {
  milestones: Array<{
    id: string;
    title: string;
    description: string | null;
    deadline: string | null;
    completed: boolean;
    sort_order: number;
  }>;
  tasks: Task[];
}

const statusOptions = [
  { value: 'ideation', label: 'Ideation' },
  { value: 'planning', label: 'Planification' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'paused', label: 'En pause' },
  { value: 'completed', label: 'Termine' },
  { value: 'abandoned', label: 'Abandonne' },
];

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then(setProject)
      .catch(() => router.push('/projects'))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function updateProject(updates: Partial<Project>) {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const updated = await res.json();
      setProject((prev) => prev ? { ...prev, ...updated } : prev);
    }
  }

  async function addTask() {
    if (!newTaskTitle.trim()) return;
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTaskTitle, project_id: id }),
    });
    if (res.ok) {
      const task = await res.json();
      setProject((prev) => prev ? { ...prev, tasks: [...prev.tasks, task] } : prev);
      setNewTaskTitle('');
    }
  }

  async function toggleTask(taskId: string, currentStatus: string) {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setProject((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === taskId ? { ...t, status: newStatus as Task['status'] } : t
          ),
        };
      });
    }
  }

  async function deleteProject() {
    if (!confirm('Supprimer ce projet et toutes ses taches ?')) return;
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (res.ok) router.push('/projects');
  }

  function startEditing(field: string, value: string) {
    setEditingField(field);
    setEditValue(value);
  }

  function saveEditing() {
    if (editingField) {
      updateProject({ [editingField]: editValue });
      setEditingField(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 rounded-xl lg:col-span-2" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!project) return null;

  const completedTasks = project.tasks.filter((t) => t.status === 'done').length;
  const totalTasks = project.tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div>
      <button
        onClick={() => router.push('/projects')}
        className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Projets
      </button>

      <PageHeader
        title={project.name}
        description={project.description || undefined}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={project.status}
              onChange={(e) => updateProject({ status: e.target.value as Project['status'] })}
              className="h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm outline-none"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <Button variant="danger" size="icon" onClick={deleteProject}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardTitle>Description</CardTitle>
            <CardContent>
              {editingField === 'description' ? (
                <div className="mt-2">
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full min-h-[100px] rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 text-sm outline-none resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={saveEditing}>Sauvegarder</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingField(null)}>Annuler</Button>
                  </div>
                </div>
              ) : (
                <p
                  className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg p-2 -m-2 transition-colors whitespace-pre-wrap"
                  onClick={() => startEditing('description', project.description || '')}
                >
                  {project.description || 'Cliquer pour ajouter une description...'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Objective */}
          <Card>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-500" /> Objectif
            </CardTitle>
            <CardContent>
              {editingField === 'objective' ? (
                <div className="mt-2">
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full min-h-[80px] rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 text-sm outline-none resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={saveEditing}>Sauvegarder</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingField(null)}>Annuler</Button>
                  </div>
                </div>
              ) : (
                <p
                  className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg p-2 -m-2 transition-colors"
                  onClick={() => startEditing('objective', project.objective || '')}
                >
                  {project.objective || 'Cliquer pour definir l\'objectif...'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card>
            <CardTitle className="flex items-center justify-between">
              <span>Taches ({completedTasks}/{totalTasks})</span>
              <span className="text-sm font-normal text-zinc-400">{progress}%</span>
            </CardTitle>
            <CardContent>
              {/* Progress bar */}
              <div className="mt-3 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Task list */}
              <ul className="space-y-1">
                {project.tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                  >
                    <button onClick={() => toggleTask(task.id, task.status)} className="shrink-0">
                      {task.status === 'done' ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-400" />
                      )}
                    </button>
                    <span
                      className={`text-sm flex-1 ${
                        task.status === 'done'
                          ? 'line-through text-zinc-400'
                          : 'text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {task.title}
                    </span>
                    <Badge variant={
                      task.priority === 'urgent' ? 'danger' :
                      task.priority === 'high' ? 'warning' :
                      'default'
                    }>
                      {task.priority}
                    </Badge>
                  </li>
                ))}
              </ul>

              {/* Add task */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Ajouter une tache..."
                  className="flex-1 h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                />
                <Button size="sm" onClick={addTask} disabled={!newTaskTitle.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sprints */}
          {(project.sprint_30 || project.sprint_90) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.sprint_30 && project.sprint_30.length > 0 && (
                <Card>
                  <CardTitle className="text-sm">Sprint 30 jours</CardTitle>
                  <CardContent>
                    <ul className="mt-2 space-y-1.5">
                      {project.sprint_30.map((item, i) => (
                        <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 flex gap-2">
                          <span className="text-zinc-400 shrink-0">-</span> {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {project.sprint_90 && project.sprint_90.length > 0 && (
                <Card>
                  <CardTitle className="text-sm">Sprint 90 jours</CardTitle>
                  <CardContent>
                    <ul className="mt-2 space-y-1.5">
                      {project.sprint_90.map((item, i) => (
                        <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 flex gap-2">
                          <span className="text-zinc-400 shrink-0">-</span> {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Priorite</p>
                <select
                  value={project.priority}
                  onChange={(e) => updateProject({ priority: e.target.value as Project['priority'] })}
                  className="w-full h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm outline-none"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Deadline</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-zinc-400" />
                  <input
                    type="date"
                    value={project.deadline || ''}
                    onChange={(e) => updateProject({ deadline: e.target.value || null })}
                    className="flex-1 h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Budget</p>
                <input
                  type="number"
                  value={project.budget || ''}
                  onChange={(e) => updateProject({ budget: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder="0"
                  className="w-full h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm outline-none"
                />
              </div>

              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Cree le</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {new Date(project.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
