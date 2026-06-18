'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, CheckSquare } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Task } from '@/types/database';

const columns = [
  { key: 'todo', label: 'A faire', color: 'bg-zinc-100 dark:bg-zinc-800' },
  { key: 'in_progress', label: 'En cours', color: 'bg-blue-50 dark:bg-blue-900/10' },
  { key: 'blocked', label: 'Bloque', color: 'bg-red-50 dark:bg-red-900/10' },
  { key: 'done', label: 'Termine', color: 'bg-emerald-50 dark:bg-emerald-900/10' },
];

const priorityVariants: Record<string, 'danger' | 'warning' | 'info' | 'default'> = {
  urgent: 'danger',
  high: 'warning',
  medium: 'info',
  low: 'default',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState('');
  const [showNew, setShowNew] = useState(false);

  const fetchTasks = useCallback(async () => {
    const res = await fetch('/api/tasks');
    if (res.ok) setTasks(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  async function createTask() {
    if (!newTask.trim()) return;
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTask }),
    });
    if (res.ok) {
      const task = await res.json();
      setTasks((prev) => [task, ...prev]);
      setNewTask('');
      setShowNew(false);
    }
  }

  async function updateStatus(taskId: string, status: string) {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: status as Task['status'] } : t)));
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Taches" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {columns.map((col) => (
            <Skeleton key={col.key} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Taches"
        description={`${tasks.filter((t) => t.status !== 'done').length} en cours`}
        actions={
          <Button onClick={() => setShowNew(!showNew)}>
            <Plus className="h-4 w-4" /> Nouvelle tache
          </Button>
        }
      />

      {showNew && (
        <Card className="mb-6 p-4">
          <div className="flex gap-3">
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Nom de la tache..."
              className="flex-1 h-10 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              onKeyDown={(e) => e.key === 'Enter' && createTask()}
              autoFocus
            />
            <Button onClick={createTask}>Ajouter</Button>
          </div>
        </Card>
      )}

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {columns.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className={`rounded-xl p-3 ${col.color}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  {col.label}
                </h3>
                <span className="text-xs text-zinc-400">{columnTasks.length}</span>
              </div>
              <div className="space-y-2">
                {columnTasks.map((task) => (
                  <Card key={task.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                      {task.title}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant={priorityVariants[task.priority]}>
                        {task.priority}
                      </Badge>
                      <select
                        value={task.status}
                        onChange={(e) => updateStatus(task.id, e.target.value)}
                        className="text-xs bg-transparent border-none outline-none text-zinc-500 cursor-pointer"
                      >
                        {columns.map((c) => (
                          <option key={c.key} value={c.key}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                    {task.project && (
                      <p className="text-xs text-zinc-400 mt-1">
                        {(task.project as { name: string }).name}
                      </p>
                    )}
                  </Card>
                ))}
                {columnTasks.length === 0 && (
                  <div className="text-center py-6">
                    <CheckSquare className="h-5 w-5 text-zinc-300 mx-auto" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
