'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Idea } from '@/types/database';

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ideas');
      if (!res.ok) throw new Error('Failed to fetch ideas');
      const data = await res.json();
      setIdeas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  const createIdea = useCallback(async (title: string, rawInput: string, source: string = 'text') => {
    const res = await fetch('/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, raw_input: rawInput, source }),
    });
    if (!res.ok) throw new Error('Failed to create idea');
    const idea = await res.json();
    setIdeas((prev) => [idea, ...prev]);
    return idea;
  }, []);

  const analyzeIdea = useCallback(async (ideaId: string) => {
    const res = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea_id: ideaId }),
    });
    if (!res.ok) throw new Error('Analysis failed');
    const result = await res.json();
    await fetchIdeas();
    return result;
  }, [fetchIdeas]);

  const deleteIdea = useCallback(async (ideaId: string) => {
    const res = await fetch(`/api/ideas/${ideaId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete idea');
    setIdeas((prev) => prev.filter((i) => i.id !== ideaId));
  }, []);

  return { ideas, loading, error, createIdea, analyzeIdea, deleteIdea, refetch: fetchIdeas };
}
