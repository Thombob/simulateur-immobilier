'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Person } from '@/types/database';

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newCompany, setNewCompany] = useState('');

  useEffect(() => {
    fetch('/api/people')
      .then((r) => r.json())
      .then(setPeople)
      .finally(() => setLoading(false));
  }, []);

  async function createPerson() {
    if (!newName.trim()) return;
    const res = await fetch('/api/people', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, role: newRole || null, company: newCompany || null }),
    });
    if (res.ok) {
      const person = await res.json();
      setPeople((prev) => [...prev, person].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName('');
      setNewRole('');
      setNewCompany('');
      setShowNew(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="People"
        description={`${people.length} contacts`}
        actions={
          <Button onClick={() => setShowNew(!showNew)}>
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        }
      />

      {showNew && (
        <Card className="mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom..."
              className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm outline-none"
              autoFocus
            />
            <input
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="Role..."
              className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm outline-none"
            />
            <input
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              placeholder="Entreprise..."
              className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm outline-none"
              onKeyDown={(e) => e.key === 'Enter' && createPerson()}
            />
          </div>
          <div className="mt-3 flex justify-end">
            <Button onClick={createPerson}>Ajouter</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : people.length === 0 ? (
        <Card className="text-center py-12">
          <Users className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-500">Aucun contact enregistre</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map((person) => (
            <Card key={person.id} className="hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-600 dark:text-zinc-300 shrink-0">
                  {person.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{person.name}</p>
                  {person.role && (
                    <p className="text-xs text-zinc-500">{person.role}</p>
                  )}
                  {person.company && (
                    <p className="text-xs text-zinc-400">{person.company}</p>
                  )}
                  {person.linkedin_url && (
                    <a
                      href={person.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1"
                    >
                      LinkedIn <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
