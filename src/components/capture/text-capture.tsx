'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TextCaptureProps {
  onSubmit: (text: string) => Promise<void>;
}

export function TextCapture({ onSubmit }: TextCaptureProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      await onSubmit(text.trim());
      setText('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Decris ton idee, projet ou reflexion..."
          className="w-full min-h-[200px] rounded-xl border border-zinc-200 bg-white p-4 text-base outline-none transition-colors focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-600 resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.metaKey) handleSubmit();
          }}
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <span className="text-xs text-zinc-400">Cmd+Enter</span>
          <Button
            onClick={handleSubmit}
            disabled={!text.trim() || loading}
            size="sm"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Analyser
          </Button>
        </div>
      </div>
    </div>
  );
}
