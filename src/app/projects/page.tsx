'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, FolderKanban } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Project } from '@/types/database';

const statusLabels: Record<string, string> = {
  ideation: 'Ideation',
  planning: 'Planification',
  in_progress: 'En cours',
  paused: 'En pause',
  completed: 'Termine',
  abandoned: 'Abandonne',
};

const statusVariants: Record<string, 'default' | 'info' | 'success' | 'warning' | 'danger'> = {
  ideation: 'default',
  planning: 'info',
  in_progress: 'success',
  paused: 'warning',
  completed: 'success',
  abandoned: 'danger',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  async function createProject() {
    if (!newName.trim()) return;
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    });
    if (res.ok) {
      const project = await res.json();
      setProjects((prev) => [project, ...prev]);
      setNewName('');
      setShowNew(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Projets"
        description={`${projects.length} projets`}
        actions={
          <Button onClick={() => setShowNew(!showNew)}>
            <Plus className="h-4 w-4" /> Nouveau projet
          </Button>
        }
      />

      {showNew && (
        <Card className="mb-6 p-4">
          <div className="flex gap-3">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom du projet..."
              className="flex-1 h-10 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              onKeyDown={(e) => e.key === 'Enter' && createProject()}
              autoFocus
            />
            <Button onClick={createProject}>Creer</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card className="text-center py-12">
          <FolderKanban className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-500">Aucun projet pour l'instant</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariants[project.status]}>
                      {statusLabels[project.status] || project.status}
                    </Badge>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{project.name}</p>
                      {project.description && (
                        <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{project.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{project.priority}</Badge>
                    {project.deadline && (
                      <span className="text-xs text-zinc-400">
                        {new Date(project.deadline).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
