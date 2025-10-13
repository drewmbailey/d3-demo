export type JobRow = { city: string; skill: string; postings: number; avgSalary: number }

export const JOBS_RAW: JobRow[] = [
  { city: 'Boston, MA',          skill: 'React', postings: 320, avgSalary: 150000 },
  { city: 'Boston, MA',          skill: 'Java',  postings: 210, avgSalary: 145000 },
  { city: 'New York, NY',        skill: 'React', postings: 540, avgSalary: 165000 },
  { city: 'New York, NY',        skill: 'AI',    postings: 420, avgSalary: 180000 },
  { city: 'San Francisco, CA',   skill: 'React', postings: 410, avgSalary: 175000 },
  { city: 'San Francisco, CA',   skill: 'AI',    postings: 360, avgSalary: 190000 },
  { city: 'Austin, TX',          skill: 'React', postings: 260, avgSalary: 140000 },
  { city: 'Austin, TX',          skill: 'Java',  postings: 200, avgSalary: 138000 },
  { city: 'Raleigh, NC',         skill: 'React', postings: 160, avgSalary: 135000 },
  { city: 'Seattle, WA',         skill: 'AI',    postings: 300, avgSalary: 185000 },
]
