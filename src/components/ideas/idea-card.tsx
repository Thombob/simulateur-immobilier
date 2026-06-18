'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { Idea } from '@/types/database';

interface IdeaCardProps {
  idea: Idea;
}

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  draft: 'default',
  analyzing: 'info',
  scored: 'success',
  active: 'success',
  archived: 'default',
  rejected: 'danger',
};

export function IdeaCard({ idea }: IdeaCardProps) {
  const globalScore = idea.score?.global_score;

  return (
    <Link href={`/ideas/${idea.id}`}>
      <Card className="group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all hover:shadow-md cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={statusColors[idea.status] || 'default'}>
                {idea.status}
              </Badge>
              {idea.category && (
                <Badge variant="outline">{idea.category.name}</Badge>
              )}
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {idea.title}
            </h3>
            {idea.summary && (
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                {idea.summary}
              </p>
            )}
            {idea.tags.length > 0 && (
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {idea.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            {globalScore !== undefined && (
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  globalScore >= 7
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : globalScore >= 5
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}
              >
                {globalScore.toFixed(1)}
              </div>
            )}
            <ArrowRight className="h-4 w-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
