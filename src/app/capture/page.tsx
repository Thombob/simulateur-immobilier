'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Type, Mic, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { TextCapture } from '@/components/capture/text-capture';
import { VoiceCapture } from '@/components/capture/voice-capture';

type Mode = 'text' | 'voice';

interface AnalysisStep {
  label: string;
  status: 'pending' | 'active' | 'done';
}

export default function CapturePage() {
  const [mode, setMode] = useState<Mode>('text');
  const [analyzing, setAnalyzing] = useState(false);
  const [steps, setSteps] = useState<AnalysisStep[]>([]);
  const router = useRouter();

  const analysisSteps: string[] = [
    'Reformulation de l\'idee',
    'Classification et tags',
    'Scoring (7 criteres)',
    'Analyse SWOT et risques',
    'Modele economique',
    'Plan d\'action',
    'Recherche de connexions',
  ];

  async function handleCapture(text: string) {
    setAnalyzing(true);
    setSteps(analysisSteps.map((label) => ({ label, status: 'pending' })));

    try {
      // Create the idea
      const ideaRes = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: text.slice(0, 100),
          raw_input: text,
          source: mode,
        }),
      });

      if (!ideaRes.ok) throw new Error('Failed to create idea');
      const idea = await ideaRes.json();

      // Simulate step progression while analyzing
      const stepInterval = setInterval(() => {
        setSteps((prev) => {
          const activeIndex = prev.findIndex((s) => s.status === 'active');
          const nextPendingIndex = prev.findIndex((s) => s.status === 'pending');

          if (activeIndex >= 0) {
            const updated = [...prev];
            updated[activeIndex] = { ...updated[activeIndex], status: 'done' };
            if (activeIndex + 1 < updated.length) {
              updated[activeIndex + 1] = { ...updated[activeIndex + 1], status: 'active' };
            }
            return updated;
          } else if (nextPendingIndex >= 0) {
            const updated = [...prev];
            updated[nextPendingIndex] = { ...updated[nextPendingIndex], status: 'active' };
            return updated;
          }
          return prev;
        });
      }, 2000);

      // Run analysis
      await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea_id: idea.id }),
      });

      clearInterval(stepInterval);
      setSteps((prev) => prev.map((s) => ({ ...s, status: 'done' as const })));

      setTimeout(() => {
        router.push(`/ideas/${idea.id}`);
      }, 1500);
    } catch {
      setAnalyzing(false);
      setSteps([]);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Capture"
        description="Partage ton idee, projet ou reflexion. L'IA fait le reste."
      />

      {analyzing ? (
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-5 w-5 text-violet-500 animate-pulse" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Analyse en cours...
            </h2>
          </div>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                {step.status === 'done' ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                ) : step.status === 'active' ? (
                  <Loader2 className="h-5 w-5 text-violet-500 animate-spin shrink-0" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-zinc-200 dark:border-zinc-700 shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    step.status === 'done'
                      ? 'text-zinc-900 dark:text-zinc-100'
                      : step.status === 'active'
                      ? 'text-violet-600 dark:text-violet-400 font-medium'
                      : 'text-zinc-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <>
          {/* Mode switcher */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('text')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'text'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              <Type className="h-4 w-4" />
              Texte
            </button>
            <button
              onClick={() => setMode('voice')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'voice'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              <Mic className="h-4 w-4" />
              Voix
            </button>
          </div>

          <Card>
            {mode === 'text' ? (
              <TextCapture onSubmit={handleCapture} />
            ) : (
              <VoiceCapture onTranscript={handleCapture} />
            )}
          </Card>
        </>
      )}
    </div>
  );
}
