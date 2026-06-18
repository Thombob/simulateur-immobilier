'use client';

import { Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-zinc-200 bg-white/80 backdrop-blur-xl px-4 lg:px-8 dark:border-zinc-800 dark:bg-zinc-950/80">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Rechercher... (Cmd+K)"
            className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-4 text-sm outline-none transition-colors focus:border-zinc-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-600 dark:focus:bg-zinc-800"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700" />
      </div>
    </header>
  );
}
