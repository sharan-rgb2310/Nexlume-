import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Lock, User, AlertCircle, Loader2, ArrowRight } from 'lucide-react'
import governmentSeal from '../assets/Seal_of_Tamil_Nadu.svg.webp'
import nexlumeLogo from '../assets/Nexlume Futuristic X Logo.png'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const destination = location.state?.from?.pathname || '/admin'

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const cleanUsername = username.trim()
    if (!cleanUsername) {
      setError('Please enter your administrator username.')
      return
    }
    if (!password) {
      setError('Please enter your password.')
      return
    }

    setIsSubmitting(true)
    try {
      await login(cleanUsername, password)
      navigate(destination, { replace: true })
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your username and password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #0b3a8c 0%, #0a2560 100%)',
      color: '#fff',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Top Banner Header */}
      <header style={{
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        background: 'rgba(11, 58, 140, 0.4)',
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src={governmentSeal}
            alt="Tamil Nadu Seal"
            style={{ width: '48px', height: '48px', objectFit: 'contain' }}
          />
          <div>
            <b style={{ display: 'block', fontSize: '15px', color: '#fff', letterSpacing: '0.3px' }}>
              Government of Tamil Nadu
            </b>
            <span style={{ fontSize: '11px', color: '#bfdbfe', opacity: 0.9 }}>
              Department of Consumer Affairs &amp; Public Distribution
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={nexlumeLogo}
            alt="Nexlume"
            style={{ height: '36px', objectFit: 'contain' }}
          />
        </div>
      </header>

      {/* Main Login Card Container */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '440px',
          background: '#ffffff',
          color: '#1e293b',
          borderRadius: '20px',
          padding: '40px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#eff6ff',
              color: '#0b3a8c',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: '0 4px 12px rgba(11, 58, 140, 0.12)',
            }}>
              <Lock size={26} strokeWidth={2.4} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 6px', color: '#0f172a' }}>
              Admin Portal Login
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
              Sign in with your authorized admin credentials
            </p>
          </div>

        

          {error && (
            <div
              role="alert"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '10px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                fontSize: '13px',
                marginBottom: '20px',
                lineHeight: 1.5,
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: '20px' }}>
              <label
                htmlFor="username-input"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '8px',
                }}
              >
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  display: 'flex',
                }}>
                  <User size={18} />
                </span>
                <input
                  id="username-input"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0b3a8c'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>
            </div>

            <div style={{ marginBottom: '26px' }}>
              <label
                htmlFor="password-input"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '8px',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  display: 'flex',
                }}>
                  <Lock size={18} />
                </span>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 42px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0b3a8c'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '13px 20px',
                borderRadius: '10px',
                background: isSubmitting ? '#93c5fd' : '#0b3a8c',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 600,
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(11, 58, 140, 0.25)',
                transition: 'background 0.2s, transform 0.1s',
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={19} />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Console</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid #f1f5f9',
            textAlign: 'center',
          }}>
            <a
              href="/"
              style={{
                fontSize: '13px',
                color: '#0b3a8c',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              ← Return to Public Stock Dashboard
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '14px 20px',
        textAlign: 'center',
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.7)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        Authorized personnel only · Government of Tamil Nadu &amp; Nexlume System
      </footer>
    </div>
  )
}
