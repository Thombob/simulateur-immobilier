'use client';

import { useState, useRef, useCallback } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceCaptureProps {
  onTranscript: (text: string) => Promise<void>;
}

export function VoiceCapture({ onTranscript }: VoiceCaptureProps) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        setDuration(0);
        setProcessing(true);

        try {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('audio', blob, 'recording.webm');

          const res = await fetch('/api/voice/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) throw new Error('Transcription failed');
          const { text } = await res.json();
          await onTranscript(text);
        } finally {
          setProcessing(false);
        }
      };

      mediaRecorder.start(1000);
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      alert('Impossible d\'acceder au microphone.');
    }
  }, [onTranscript]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }, []);

  function formatDuration(s: number): string {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  return (
    <div className="flex flex-col items-center gap-6 py-12">
      {processing ? (
        <>
          <div className="h-24 w-24 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
          <p className="text-sm text-zinc-500">Transcription en cours...</p>
        </>
      ) : recording ? (
        <>
          <button
            onClick={stopRecording}
            className="h-24 w-24 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors animate-pulse"
          >
            <Square className="h-8 w-8 text-white" />
          </button>
          <div className="text-center">
            <p className="text-2xl font-mono font-medium text-zinc-900 dark:text-zinc-100">
              {formatDuration(duration)}
            </p>
            <p className="text-sm text-zinc-500 mt-1">Enregistrement en cours...</p>
          </div>
        </>
      ) : (
        <>
          <button
            onClick={startRecording}
            className="h-24 w-24 rounded-full bg-zinc-900 dark:bg-white flex items-center justify-center hover:scale-105 transition-transform"
          >
            <Mic className="h-8 w-8 text-white dark:text-zinc-900" />
          </button>
          <p className="text-sm text-zinc-500">Appuie pour enregistrer ton idee</p>
        </>
      )}
    </div>
  );
}
