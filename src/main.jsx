import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ContentProvider } from './context/ContentContext'
import './index.css'

const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))

function isAdminPath() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  return path === '/admin' || path.startsWith('/admin/')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isAdminPath() ? (
      <Suspense
        fallback={
          <main className="min-h-screen bg-[#FAF7F0] grid place-items-center text-sm text-[#5F6B7A]">
            در حال باز کردن پنل…
          </main>
        }
      >
        <AdminApp />
      </Suspense>
    ) : (
      <ContentProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ContentProvider>
    )}
  </React.StrictMode>,
)
