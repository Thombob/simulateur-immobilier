'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, LayoutGrid, List, Filter } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { IdeaCard } from '@/components/ideas/idea-card';
import { useIdeas } from '@/hooks/use-ideas';

type ViewMode = 'cards' | 'list';

const statusFilters = [
  { value: '', label: 'Toutes' },
  { value: 'draft', label: 'Brouillon' },
  { value: 'analyzing', label: 'En analyse' },
  { value: 'scored', label: 'Scorees' },
  { value: 'active', label: 'Actives' },
  { value: 'archived', label: 'Archivees' },
];

export default function IdeasPage() {
  const { ideas, loading } = useIdeas();
  const [view, setView] = useState<ViewMode>('cards');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredIdeas = statusFilter
    ? ideas.filter((i) => i.status === statusFilter)
    : ideas;

  return (
    <div>
      <PageHeader
        title="Ideas"
        description={`${ideas.length} idees capturees`}
        actions={
          <Link href="/capture">
            <Button>
              <Plus className="h-4 w-4" />
              Nouvelle idee
            </Button>
          </Link>
        }
      />

      {/* Filters & View */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="h-4 w-4 text-zinc-400 shrink-0" />
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === f.value
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant={view === 'cards' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setView('cards')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : filteredIdeas.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-zinc-500 mb-4">Aucune idee trouvee</p>
          <Link href="/capture">
            <Button>Capturer ta premiere idee</Button>
          </Link>
        </Card>
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIdeas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredIdeas.map((idea) => (
            <Link key={idea.id} href={`/ideas/${idea.id}`}>
              <div className="flex items-center gap-4 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <Badge variant={idea.status === 'scored' ? 'success' : 'default'}>
                  {idea.status}
                </Badge>
                <span className="flex-1 text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                  {idea.title}
                </span>
                {idea.score && (
                  <span className="text-sm font-bold text-emerald-600">
                    {idea.score.global_score.toFixed(1)}
                  </span>
                )}
                <span className="text-xs text-zinc-400">
                  {new Date(idea.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
