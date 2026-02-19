import { Navigate, Route, Routes } from 'react-router-dom'
import { SiteLayout } from './components/SiteLayout.tsx'
import { HomePage } from './pages/HomePage.tsx'
import { NewRequestPage } from './pages/NewRequestPage.tsx'
import { NotFoundPage } from './pages/NotFoundPage.tsx'
import { ServicesPage } from './pages/ServicesPage.tsx'
import { TrackPage } from './pages/TrackPage.tsx'

function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="request" element={<NewRequestPage />} />
        <Route path="track" element={<TrackPage />} />
        <Route path="home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
