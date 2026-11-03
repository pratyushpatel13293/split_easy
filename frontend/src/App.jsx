import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { ToastProvider } from './components/Toast'
import Users from './pages/Users'
import Groups from './pages/Groups'
import GroupDetail from './pages/GroupDetail'
import Expenses from './pages/Expenses'
import NotFound from './pages/NotFound'
import { Loading } from './components/ui'

// Dashboard pulls in the chart library, so load it on demand to keep the first download small.
const Dashboard = lazy(() => import('./pages/Dashboard'))

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Suspense fallback={<Loading />}><Dashboard /></Suspense>} />
            <Route path="users" element={<Users />} />
            <Route path="groups" element={<Groups />} />
            <Route path="groups/:id" element={<GroupDetail />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
