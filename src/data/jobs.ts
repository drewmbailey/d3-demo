export type JobRow = { city: string; skill: string; postings: number; avgSalary: number }

export const JOBS_RAW: JobRow[] = [
  // Boston, MA
  { city: 'Boston, MA',          skill: 'React', postings: 320, avgSalary: 150000 },
  { city: 'Boston, MA',          skill: 'Java',  postings: 210, avgSalary: 145000 },
  { city: 'Boston, MA',          skill: 'AI',    postings: 180, avgSalary: 170000 },
  { city: 'Boston, MA',          skill: 'Python', postings: 280, avgSalary: 155000 },
  { city: 'Boston, MA',          skill: 'Go',    postings: 95, avgSalary: 160000 },
  
  // New York, NY
  { city: 'New York, NY',        skill: 'React', postings: 540, avgSalary: 165000 },
  { city: 'New York, NY',        skill: 'Java',  postings: 380, avgSalary: 160000 },
  { city: 'New York, NY',        skill: 'AI',    postings: 420, avgSalary: 180000 },
  { city: 'New York, NY',        skill: 'Python', postings: 480, avgSalary: 170000 },
  { city: 'New York, NY',        skill: 'Go',    postings: 180, avgSalary: 175000 },
  
  // San Francisco, CA
  { city: 'San Francisco, CA',   skill: 'React', postings: 410, avgSalary: 175000 },
  { city: 'San Francisco, CA',   skill: 'Java',  postings: 320, avgSalary: 170000 },
  { city: 'San Francisco, CA',   skill: 'AI',    postings: 360, avgSalary: 190000 },
  { city: 'San Francisco, CA',   skill: 'Python', postings: 520, avgSalary: 185000 },
  { city: 'San Francisco, CA',   skill: 'Go',    postings: 220, avgSalary: 195000 },
  
  // Austin, TX
  { city: 'Austin, TX',          skill: 'React', postings: 260, avgSalary: 140000 },
  { city: 'Austin, TX',          skill: 'Java',  postings: 200, avgSalary: 138000 },
  { city: 'Austin, TX',          skill: 'AI',    postings: 150, avgSalary: 155000 },
  { city: 'Austin, TX',          skill: 'Python', postings: 240, avgSalary: 145000 },
  { city: 'Austin, TX',          skill: 'Go',    postings: 120, avgSalary: 150000 },
  
  // Raleigh, NC
  { city: 'Raleigh, NC',         skill: 'React', postings: 160, avgSalary: 135000 },
  { city: 'Raleigh, NC',         skill: 'Java',  postings: 140, avgSalary: 130000 },
  { city: 'Raleigh, NC',         skill: 'AI',    postings: 80, avgSalary: 145000 },
  { city: 'Raleigh, NC',         skill: 'Python', postings: 180, avgSalary: 140000 },
  { city: 'Raleigh, NC',         skill: 'Go',    postings: 60, avgSalary: 145000 },
  
  // Seattle, WA
  { city: 'Seattle, WA',         skill: 'React', postings: 280, avgSalary: 160000 },
  { city: 'Seattle, WA',         skill: 'Java',  postings: 220, avgSalary: 155000 },
  { city: 'Seattle, WA',         skill: 'AI',    postings: 300, avgSalary: 185000 },
  { city: 'Seattle, WA',         skill: 'Python', postings: 320, avgSalary: 180000 },
  { city: 'Seattle, WA',         skill: 'Go',    postings: 140, avgSalary: 185000 },
]
