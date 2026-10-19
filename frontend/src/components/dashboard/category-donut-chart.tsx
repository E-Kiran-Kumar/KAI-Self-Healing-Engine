'use client';

import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CategoryDistribution } from '@/types/analytics';

interface CategoryDonutChartProps {
  data: CategoryDistribution[];
}

const CATEGORY_COLORS: Record<string, string> = {
  UI: '#3b82f6',
  API: '#06b6d4',
  timeout: '#f59e0b',
  network: '#8b5cf6',
  database: '#ec4899',
  validation: '#10b981',
  authentication: '#f43f5e',
};

export function CategoryDonutChart({ data }: CategoryDonutChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-64 flex items-center justify-center text-xs text-slate-400">Loading categories...</div>;
  }

  const chartData = data.filter((d) => d.count > 0);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="h-56 w-56 shrink-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="count"
              nameKey="category"
            >
              {chartData.map((entry) => (
                <Cell
                  key={`cell-${entry.category}`}
                  fill={CATEGORY_COLORS[entry.category] || '#64748b'}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: '#f8fafc',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {data.reduce((sum, d) => sum + d.count, 0)}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400">Incidents</span>
        </div>
      </div>

      <div className="flex-1 space-y-2 w-full text-xs">
        {data.map((item) => (
          <div key={item.category} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#64748b' }}
              />
              <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                {item.category}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-500 font-mono text-[11px]">{item.count} items</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 w-10 text-right">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
