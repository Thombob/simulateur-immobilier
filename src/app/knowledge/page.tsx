'use client';

import { useState, useEffect } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Knowledge } from '@/types/database';

const levelColors: Record<string, 'default' | 'info' | 'warning' | 'success'> = {
  beginner: 'default',
  intermediate: 'info',
  advanced: 'warning',
  expert: 'success',
};

export default function KnowledgePage() {
  const [items, setItems] = useState<Knowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newSubject, setNewSubject] = useState('');

  useEffect(() => {
    fetch('/api/knowledge')
      .then((r) => r.json())
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  async function createKnowledge() {
    if (!newSubject.trim()) return;
    const res = await fetch('/api/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: newSubject }),
    });
    if (res.ok) {
      const item = await res.json();
      setItems((prev) => [item, ...prev]);
      setNewSubject('');
      setShowNew(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Knowledge Base"
        description={`${items.length} sujets`}
        actions={
          <Button onClick={() => setShowNew(!showNew)}>
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        }
      />

      {showNew && (
        <Card className="mb-6 p-4">
          <div className="flex gap-3">
            <input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Sujet..."
              className="flex-1 h-10 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              onKeyDown={(e) => e.key === 'Enter' && createKnowledge()}
              autoFocus
            />
            <Button onClick={createKnowledge}>Ajouter</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="text-center py-12">
          <BookOpen className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-500">Aucune connaissance enregistree</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.subject}</h3>
                <Badge variant={levelColors[item.level]}>{item.level}</Badge>
              </div>
              {item.summary && (
                <p className="text-xs text-zinc-500 line-clamp-3">{item.summary}</p>
              )}
              {item.project && (
                <p className="text-xs text-zinc-400 mt-2">
                  Projet: {(item.project as { name: string }).name}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
