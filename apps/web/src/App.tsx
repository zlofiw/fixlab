import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { SiteLayout } from './components/SiteLayout.tsx'

const HomePage = lazy(() => import('./pages/HomePage.tsx').then((module) => ({ default: module.HomePage })))
const ServicesPage = lazy(() => import('./pages/ServicesPage.tsx').then((module) => ({ default: module.ServicesPage })))
const NewRequestPage = lazy(() => import('./pages/NewRequestPage.tsx').then((module) => ({ default: module.NewRequestPage })))
const TrackPage = lazy(() => import('./pages/TrackPage.tsx').then((module) => ({ default: module.TrackPage })))
const AdminPage = lazy(() => import('./pages/AdminPage.tsx').then((module) => ({ default: module.AdminPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.tsx').then((module) => ({ default: module.NotFoundPage })))

function PageFallback() {
  return (
    <div className="grid min-h-[40vh] place-items-center py-10">
      <div className="panel w-full max-w-xl rounded-3xl p-6 text-center">
        <p className="text-sm font-semibold text-slate-600">Загрузка раздела...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="request" element={<NewRequestPage />} />
          <Route path="track" element={<TrackPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App

