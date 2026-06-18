'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Lightbulb,
  FolderKanban,
  CheckSquare,
  BookOpen,
  Users,
  Scale,
  Mic,
  GraduationCap,
  Swords,
  Rocket,
  Network,
  Settings,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Capture', href: '/capture', icon: Mic },
  { type: 'separator' as const, label: 'Bases' },
  { name: 'Ideas', href: '/ideas', icon: Lightbulb },
  { name: 'Projets', href: '/projects', icon: FolderKanban },
  { name: 'Taches', href: '/tasks', icon: CheckSquare },
  { name: 'Knowledge', href: '/knowledge', icon: BookOpen },
  { name: 'People', href: '/people', icon: Users },
  { name: 'Decisions', href: '/decisions', icon: Scale },
  { type: 'separator' as const, label: 'IA' },
  { name: 'Mentor', href: '/mentor', icon: GraduationCap },
  { name: 'Coach', href: '/coach', icon: Swords },
  { name: 'Execution', href: '/execution', icon: Rocket },
  { name: 'Connexions', href: '/connections', icon: Network },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-zinc-200 lg:bg-zinc-50 dark:lg:border-zinc-800 dark:lg:bg-zinc-950 h-screen sticky top-0">
      <div className="flex h-16 items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center">
            <span className="text-white dark:text-zinc-900 font-bold text-sm">L</span>
          </div>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">Life OS AI</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navigation.map((item, i) => {
            if ('type' in item && item.type === 'separator') {
              return (
                <li key={i} className="pt-4 pb-1 px-3">
                  <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    {item.label}
                  </span>
                </li>
              );
            }
            if (!('href' in item)) return null;
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-zinc-200 dark:border-zinc-800 p-3">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
        >
          <Settings className="h-4 w-4" />
          Parametres
        </Link>
      </div>
    </aside>
  );
}
