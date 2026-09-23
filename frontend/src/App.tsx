import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { Overview } from './pages/Overview'
import { NewExperiment } from './pages/NewExperiment'
import { ExperimentRunning } from './pages/ExperimentRunning'
import { Results } from './pages/Results'
import { SensitivityAnalysis } from './pages/SensitivityAnalysis'
import { Mutations } from './pages/Mutations'
import { Analysis } from './pages/Analysis'
import { Export } from './pages/Export'
import { Experiments } from './pages/Experiments'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Overview />} />
          <Route path="new" element={<NewExperiment />} />
          <Route path="running" element={<ExperimentRunning />} />
          <Route path="experiments" element={<Experiments />} />
          <Route path="results" element={<Results />} />
          <Route path="sensitivity" element={<SensitivityAnalysis />} />
          <Route path="mutations" element={<Mutations />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="export" element={<Export />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
