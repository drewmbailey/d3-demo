import React, { createContext, useContext, useId, useState } from 'react';
import { clsx } from 'clsx';

type Ctx = { index: number; setIndex: (i: number) => void; tabsId: string };
const TabsCtx = createContext<Ctx | null>(null);

export function Tabs({ defaultIndex = 0, onChange, children }: { defaultIndex?: number; onChange?: (i: number) => void; children: React.ReactNode }) {
  const [index, setIndex] = useState(defaultIndex);
  const tabsId = useId();
  const set = (i: number) => { setIndex(i); onChange?.(i); };
  return <TabsCtx.Provider value={{ index, setIndex: set, tabsId }}>{children}</TabsCtx.Provider>;
}

export function TabList({ children }: { children: React.ReactNode }) {
  const ctx = useTabs();
  return (
    <div role="tablist" aria-label="Sections" className="flex gap-2 mb-4">
      {React.Children.map(children, (child, i) => React.isValidElement(child) ? React.cloneElement(child, { i }) : child)}
    </div>
  );
}

export function Tab({ children, i = 0 }: { children: React.ReactNode; i?: number }) {
  const { index, setIndex, tabsId } = useTabs();
  const selected = index === i;
  return (
    <button
      role="tab"
      id={`${tabsId}-tab-${i}`}
      aria-selected={selected}
      aria-controls={`${tabsId}-panel-${i}`}
      tabIndex={selected ? 0 : -1}
      onClick={() => setIndex(i)}
      className={clsx('px-4 py-2 rounded-2xl border shadow-sm transition',
        selected ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-neutral-900 border-neutral-800 text-neutral-200 hover:border-neutral-700')}
    >
      {children}
    </button>
  );
}

export function TabPanels({ children }: { children: React.ReactNode }) {
  const { index, tabsId } = useTabs();
  return (
    <div>
      {React.Children.map(children, (child, i) => (
        <div
          role="tabpanel"
          id={`${tabsId}-panel-${i}`}
          aria-labelledby={`${tabsId}-tab-${i}`}
          hidden={index !== i}
          className="rounded-3xl bg-neutral-900/50 border border-neutral-800 p-4 md:p-6"
        >
          {child}
        </div>
      ))}
    </div>
  );
}

export function TabPanel({ children }: { children: React.ReactNode }) { return <>{children}</>; }

function useTabs() {
  const ctx = useContext(TabsCtx);
  if (!ctx) throw new Error('Tabs components must be used within <Tabs>');
  return ctx;
}
