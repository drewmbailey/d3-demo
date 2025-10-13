export type StockRow = { date: string; symbol: string; close: number }

export const STOCKS_RAW: StockRow[] = (() => {
  const start = new Date('2025-08-01')
  const syms = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'AMZN']
  const out: StockRow[] = []
  for (let i = 0; i < 30; i++) {
    const d = new Date(start); d.setDate(d.getDate() + i)
    syms.forEach((s, idx) => {
      const base = 150 + idx * 100
      const close = base + Math.sin(i/3 + idx) * 12 + i * (idx === 1 ? 1.5 : 0.5)
      out.push({ date: d.toISOString().slice(0,10), symbol: s, close: Math.round(close*100)/100 })
    })
  }
  return out
})()
