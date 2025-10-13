import React from 'react'
import BubbleChart from '@/components/charts/BubbleChart'
import { JOBS_RAW } from '@/data/jobs'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useResponsiveDimensions } from '@/hooks/useResponsiveDimensions'

export default function JobsPanel() {
  const [skill, setSkill] = React.useState('React')
  const [isLoading, setIsLoading] = React.useState(false)

  const dimensions = useResponsiveDimensions()

  const rows = React.useMemo(() => 
    JOBS_RAW.filter(d => d.skill === skill), 
    [skill]
  )
  
  const cities = React.useMemo(() => 
    rows.map(r => r.city), 
    [rows]
  )

  const availableSkills = React.useMemo(() => 
    Array.from(new Set(JOBS_RAW.map(d => d.skill))), 
    []
  )

  const handleSkillChange = React.useCallback((newSkill: string) => {
    setSkill(newSkill)
  }, [])

  return (
    <ErrorBoundary>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm">
          <label className="opacity-80" htmlFor="skill-select">
            Skill
          </label>
          <select 
            id="skill-select"
            className="bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1 text-neutral-100 focus:border-indigo-500 focus:outline-none" 
            value={skill} 
            onChange={e => handleSkillChange(e.target.value)}
            aria-label="Select skill to filter job data"
          >
            {availableSkills.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <BubbleChart 
          data={rows} 
          xTicks={cities}
          dimensions={dimensions}
        />
      </div>
    </ErrorBoundary>
  )
}
