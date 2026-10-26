import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShieldAlert, Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        gap: '16px',
        color: '#0b3a8c',
        fontFamily: 'Inter, sans-serif',
      }}>
        <Loader2 className="animate-spin" size={40} color="#0b3a8c" />
        <span style={{ fontSize: '15px', fontWeight: 600 }}>Verifying credentials…</span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isAdmin) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: '#f8fafc',
        textAlign: 'center',
      }}>
        <div style={{
          maxWidth: '480px',
          background: '#fff',
          padding: '36px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
          border: '1px solid #fee2e2',
        }}>
          <ShieldAlert size={56} color="#ef4444" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#991b1b', marginBottom: '8px' }}>
            Access Restricted
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
            Your account does not have administrator privileges to manage the Nexlume Fair Price Shop system.
          </p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              borderRadius: '8px',
              background: '#0b3a8c',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            Return to Public Dashboard
          </a>
        </div>
      </div>
    )
  }

  return children
}
