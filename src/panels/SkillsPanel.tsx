import React from 'react';
import * as d3 from 'd3';
import BarChart from '@/components/charts/BarChart';
import { SkillData } from '@/types';
import { JOBS_RAW } from '@/data/jobs';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useResponsiveDimensions } from '@/hooks/useResponsiveDimensions';

export default function SkillsPanel() {
  const dimensions = useResponsiveDimensions();

  const aggregatedData = React.useMemo((): SkillData[] => {
    const grouped = d3.rollup(
      JOBS_RAW,
      v => {
        const totalPostings = d3.sum(v, d => d.postings);
        const avgSalary = d3.mean(v, d => d.avgSalary) ?? 0;
        
        const cityGroups = d3.rollup(v, group => d3.sum(group, d => d.postings), d => d.city);
        const entries = Array.from(cityGroups.entries());
        const maxCount = d3.max(entries, ([, count]) => count);
        const topCityEntry = entries.find(([, count]) => count === maxCount);
        const topCity = topCityEntry ? topCityEntry[0] : '';
        
        return {
          totalPostings,
          avgSalary,
          topCity
        }
      },
      d => d.skill
    )

    return Array.from(grouped.entries()).map(([skill, data]) => ({
      skill,
      ...data
    })).sort((a, b) => b.totalPostings - a.totalPostings)
  }, [])

  return (
    <ErrorBoundary>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-100 mb-1">
              Job Postings by Skill
            </h2>
            <p className="text-sm text-neutral-400">
              Total job postings aggregated across all cities, with average salary and top city
            </p>
          </div>
          <div className="text-xs text-neutral-500 bg-neutral-800 px-2 py-1 rounded">
            {aggregatedData.length} skills
          </div>
        </div>
        
        <BarChart 
          data={aggregatedData} 
          dimensions={dimensions}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3">
            <div className="text-sm font-medium text-neutral-300 mb-1">Total Skills</div>
            <div className="text-2xl font-bold text-indigo-400">{aggregatedData.length}</div>
          </div>
          <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3">
            <div className="text-sm font-medium text-neutral-300 mb-1">Total Postings</div>
            <div className="text-2xl font-bold text-green-400">
              {d3.sum(aggregatedData, d => d.totalPostings).toLocaleString()}
            </div>
          </div>
          <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3">
            <div className="text-sm font-medium text-neutral-300 mb-1">Top Skill</div>
            <div className="text-2xl font-bold text-yellow-400">
              {aggregatedData[0]?.skill || 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
