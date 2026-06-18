'use client';

import { useState, useEffect } from 'react';
import { Network, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Connection } from '@/types/database';

const entityTypeColors: Record<string, string> = {
  idea: 'bg-violet-500',
  project: 'bg-blue-500',
  knowledge: 'bg-amber-500',
  person: 'bg-emerald-500',
};

const entityTypeLabels: Record<string, string> = {
  idea: 'Idee',
  project: 'Projet',
  knowledge: 'Knowledge',
  person: 'Personne',
};

interface ConnectionWithNames extends Connection {
  source_name?: string;
  target_name?: string;
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<ConnectionWithNames[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/connections')
      .then((r) => r.json())
      .then(setConnections)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader title="Connexions" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Connexions"
        description={`${connections.length} liens decouverts par l'IA`}
      />

      {/* Graph placeholder */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex items-center justify-center py-12 bg-zinc-50 dark:bg-zinc-800/30 rounded-lg">
            <div className="text-center">
              <Network className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">Graphe de connexions</p>
              <p className="text-xs text-zinc-400 mt-1">Les connexions sont decouvertes automatiquement par l'IA lors de l'analyse</p>
            </div>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 justify-center">
            {Object.entries(entityTypeLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={`h-3 w-3 rounded-full ${entityTypeColors[key]}`} />
                <span className="text-xs text-zinc-500">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connection list */}
      {connections.length === 0 ? (
        <Card className="text-center py-12">
          <Network className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-500">Aucune connexion decouverte</p>
          <p className="text-xs text-zinc-400 mt-1">Les connexions sont creees automatiquement lors de l'analyse d'idees</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {connections.map((conn) => (
            <Card key={conn.id} className="p-4">
              <div className="flex items-center gap-3">
                {/* Source */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`h-3 w-3 rounded-full shrink-0 ${entityTypeColors[conn.source_type]}`} />
                  <Badge variant="outline">{entityTypeLabels[conn.source_type]}</Badge>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {conn.source_name || conn.source_id.slice(0, 8)}
                  </span>
                </div>

                {/* Arrow */}
                <div className="flex items-center gap-1 shrink-0 px-2">
                  <ArrowRight className="h-4 w-4 text-zinc-400" />
                </div>

                {/* Target */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`h-3 w-3 rounded-full shrink-0 ${entityTypeColors[conn.target_type]}`} />
                  <Badge variant="outline">{entityTypeLabels[conn.target_type]}</Badge>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {conn.target_name || conn.target_id.slice(0, 8)}
                  </span>
                </div>

                {/* Strength */}
                <div className="shrink-0 ml-auto">
                  {conn.strength && (
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${(conn.strength as number) * 10}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-400 w-6 text-right">{conn.strength}</span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-2 pl-5">{conn.relationship}</p>
              {conn.ai_generated && (
                <Badge variant="info" className="mt-1 ml-5">IA</Badge>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
