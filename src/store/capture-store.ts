import { create } from 'zustand';

interface CaptureState {
  mode: 'text' | 'voice';
  isOpen: boolean;
  isAnalyzing: boolean;
  analysisProgress: { step: number; total: number; label: string } | null;
  setMode: (mode: 'text' | 'voice') => void;
  setOpen: (open: boolean) => void;
  setAnalyzing: (analyzing: boolean) => void;
  setProgress: (progress: { step: number; total: number; label: string } | null) => void;
}

export const useCaptureStore = create<CaptureState>((set) => ({
  mode: 'text',
  isOpen: false,
  isAnalyzing: false,
  analysisProgress: null,
  setMode: (mode) => set({ mode }),
  setOpen: (isOpen) => set({ isOpen }),
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setProgress: (analysisProgress) => set({ analysisProgress }),
}));
