'use client';

import { useState, useEffect } from 'react';
import { Plus, Scale } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Decision } from '@/types/database';

const statusVariants: Record<string, 'warning' | 'success' | 'info'> = {
  pending: 'warning',
  decided: 'success',
  revisiting: 'info',
};

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newSubject, setNewSubject] = useState('');

  useEffect(() => {
    fetch('/api/decisions')
      .then((r) => r.json())
      .then(setDecisions)
      .finally(() => setLoading(false));
  }, []);

  async function createDecision() {
    if (!newSubject.trim()) return;
    const res = await fetch('/api/decisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: newSubject }),
    });
    if (res.ok) {
      const decision = await res.json();
      setDecisions((prev) => [decision, ...prev]);
      setNewSubject('');
      setShowNew(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Decisions"
        description={`${decisions.filter((d) => d.status === 'pending').length} en attente`}
        actions={
          <Button onClick={() => setShowNew(!showNew)}>
            <Plus className="h-4 w-4" /> Nouvelle decision
          </Button>
        }
      />

      {showNew && (
        <Card className="mb-6 p-4">
          <div className="flex gap-3">
            <input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Sujet de la decision..."
              className="flex-1 h-10 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
              onKeyDown={(e) => e.key === 'Enter' && createDecision()}
              autoFocus
            />
            <Button onClick={createDecision}>Creer</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : decisions.length === 0 ? (
        <Card className="text-center py-12">
          <Scale className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-500">Aucune decision en attente</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {decisions.map((decision) => (
            <Card key={decision.id} className="hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariants[decision.status]}>
                    {decision.status}
                  </Badge>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{decision.subject}</p>
                    {decision.context && (
                      <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{decision.context}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {decision.final_decision ? (
                    <p className="text-xs text-emerald-600 font-medium">{decision.final_decision}</p>
                  ) : decision.ai_recommendation ? (
                    <p className="text-xs text-violet-500">IA: {decision.ai_recommendation}</p>
                  ) : null}
                  <span className="text-xs text-zinc-400">
                    {new Date(decision.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
