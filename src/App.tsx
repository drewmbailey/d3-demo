import React from 'react'
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@/components/tabs/Tabs'
import StocksPanel from '@/panels/StocksPanel'
import JobsPanel from '@/panels/JobsPanel'
import FrameworksPanel from '@/panels/FrameworksPanel'
import SkillsPanel from '@/panels/SkillsPanel'

export default function App() {
  return (
    <div className="min-h-screen w-full p-6">
      <header className="max-w-6xl mx-auto mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Tech Trends Explorer</h1>
        <p className="text-neutral-400">React + TypeScript + D3 + Tailwind</p>
      </header>

      <main className="max-w-6xl mx-auto">
        <Tabs defaultIndex={0} onChange={() => postHeight()}>
          <TabList>
            <Tab>Stocks</Tab>
            <Tab>Job Market</Tab>
            <Tab>Frameworks</Tab>
            <Tab>Skills</Tab>
          </TabList>
          <TabPanels>
            <TabPanel><StocksPanel /></TabPanel>
            <TabPanel><JobsPanel /></TabPanel>
            <TabPanel><FrameworksPanel /></TabPanel>
            <TabPanel><SkillsPanel /></TabPanel>
          </TabPanels>
        </Tabs>
      </main>
    </div>
  )
}

// micro‑frontend: post our height so the host page can auto-resize iframe
function postHeight() {
  const h = document.documentElement.scrollHeight
  parent?.postMessage({ type: 'TTE_HEIGHT', height: h }, '*')
}

// Resize notifications on content changes
const ro = new ResizeObserver(() => postHeight())
ro.observe(document.documentElement)
