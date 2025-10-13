export type FrameworkRow = { date: string; name: string; value: number };

export const FRAMEWORKS_RAW: FrameworkRow[] = (() => {
  const start = new Date('2020-01-01');
  const names = ['React','Vue','Angular','Svelte','Next.js'] as const;
  const out: FrameworkRow[] = [];
  for (let i = 0; i < 36; i++) {
    const d = new Date(start); d.setMonth(d.getMonth() + i);
    names.forEach((n, idx) => {
      const base = 50 - idx*6;
      const v = base + Math.sin(i/(3+idx))*6 + (n==='React' ? i*0.3 : i*(idx===3 ? 0.2 : 0.05));
      out.push({ date: d.toISOString().slice(0,10), name: n, value: Math.max(0, Math.round(v*10)/10) });
    });
  }
  return out;
})();
