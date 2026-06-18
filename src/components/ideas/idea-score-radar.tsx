'use client';

import type { IdeaScore } from '@/types/database';

interface ScoreRadarProps {
  score: IdeaScore;
}

const criteria = [
  { key: 'economic_potential', label: 'Potentiel economique' },
  { key: 'execution_ease', label: 'Facilite execution' },
  { key: 'capital_required', label: 'Capital (inverse)' },
  { key: 'time_required', label: 'Temps (inverse)' },
  { key: 'scalability', label: 'Scalabilite' },
  { key: 'skill_compatibility', label: 'Competences' },
  { key: 'success_probability', label: 'Probabilite succes' },
] as const;

export function IdeaScoreRadar({ score }: ScoreRadarProps) {
  const size = 280;
  const center = size / 2;
  const radius = 110;
  const levels = 5;

  function getPoint(index: number, value: number): { x: number; y: number } {
    const angle = (Math.PI * 2 * index) / criteria.length - Math.PI / 2;
    const r = (value / 10) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  }

  const dataPoints = criteria.map((c, i) => {
    const val = score[c.key as keyof IdeaScore] as number;
    return getPoint(i, val);
  });

  const polygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px]">
        {/* Grid levels */}
        {Array.from({ length: levels }).map((_, level) => {
          const r = ((level + 1) / levels) * radius;
          const points = criteria
            .map((_, i) => {
              const angle = (Math.PI * 2 * i) / criteria.length - Math.PI / 2;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            })
            .join(' ');
          return (
            <polygon
              key={level}
              points={points}
              fill="none"
              stroke="currentColor"
              className="text-zinc-200 dark:text-zinc-700"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Axis lines */}
        {criteria.map((_, i) => {
          const end = getPoint(i, 10);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={end.x}
              y2={end.y}
              stroke="currentColor"
              className="text-zinc-200 dark:text-zinc-700"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={polygon}
          fill="rgba(16, 185, 129, 0.15)"
          stroke="rgb(16, 185, 129)"
          strokeWidth="2"
        />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="rgb(16, 185, 129)" />
        ))}

        {/* Labels */}
        {criteria.map((c, i) => {
          const labelPoint = getPoint(i, 12.5);
          return (
            <text
              key={c.key}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-zinc-500 dark:fill-zinc-400 text-[8px]"
            >
              {c.label}
            </text>
          );
        })}
      </svg>

      <div className="mt-4 text-center">
        <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          {score.global_score.toFixed(1)}
          <span className="text-lg text-zinc-400">/10</span>
        </div>
        <p className="text-sm text-zinc-500">Score global</p>
      </div>

      <div className="mt-4 w-full space-y-2">
        {criteria.map((c) => {
          const val = score[c.key as keyof IdeaScore] as number;
          return (
            <div key={c.key} className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 w-36 shrink-0">{c.label}</span>
              <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${val * 10}%` }}
                />
              </div>
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 w-6 text-right">
                {val}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
