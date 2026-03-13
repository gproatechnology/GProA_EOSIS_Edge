import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bypassMode, setBypassMode] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  // BYPASS: Login sin credenciales (temporal para desarrollo)
  const handleBypassLogin = async () => {
    setLoading(true)
    // Simular login directo sin autenticación real
    // Formato: bypass_<userId>_<username>_<role>
    const bypassUser = {
      username: 'admin',
      role: 'ADMIN',
      userId: 1
    }
    localStorage.setItem('token', 'bypass_1_admin_ADMIN')
    localStorage.setItem('user', JSON.stringify(bypassUser))
    setLoading(false)
    toast.success('Acceso directo (bypass)')
    navigate('/dashboard')
  }

  const processLoginResult = (result) => {
    if (result.success) {
      toast.success(`Bienvenido, ${result.user.username}!`)
      
      // Redirect based on role
      switch (result.user.role) {
        case 'ADMIN':
          navigate('/dashboard')
          break
        case 'SUPERVISOR':
          navigate('/monitor')
          break
        case 'CASHIER':
          navigate('/scanner')
          break
        case 'EMPLOYEE':
          navigate('/mis-consumos')
          break
        default:
          navigate('/')
      }
    } else {
      toast.error(result.error || 'Credenciales incorrectas')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!username || !password) {
      toast.error('Por favor ingresa usuario y contraseña')
      return
    }

    setLoading(true)
    const result = await login(username, password)
    setLoading(false)
    processLoginResult(result)
  }

  const handleSelectUser = (role) => {
    // Modo offline/bypass forzado por falta de API backend
    loginBypass(role)
  }

  const loginBypass = (roleType) => {
    // Simulated bypass token and user
    const bypassToken = `bypass_${roleType}_${Date.now()}`
    
    // Create mock user based on role
    const mockUser = {
      username: `${roleType}_demo`,
      role: roleType === 'admin' ? 'ADMIN' : roleType === 'supervisor' ? 'SUPERVISOR' : 'CASHIER',
      userId: Math.floor(Math.random() * 1000)
    }
    
    // Set in localStorage directly to bypass auth flow
    localStorage.setItem('token', bypassToken)
    localStorage.setItem('user', JSON.stringify(mockUser))
    
    toast.success(`Acceso demo: ${mockUser.role}`)
    
    // Check route 
    let route = '/'
    switch (mockUser.role) {
      case 'ADMIN': route = '/dashboard'; break
      case 'SUPERVISOR': route = '/monitor'; break
      case 'CASHIER': route = '/scanner'; break
    }
    
    // Force reload to apply auth state across app
    window.location.href = route
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #dc2626 0%, transparent 40%), radial-gradient(circle at 20% 80%, #1e293b 0%, transparent 40%)' }}>
      </div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiM0NzU1NjkiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-50"></div>

      <div className="bg-slate-900 rounded-2xl shadow-[0_0_40px_rgba(220,38,38,0.15)] border border-slate-800 p-8 w-full max-w-md relative z-10 overflow-hidden">
        {/* Red Top Accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-red-800"></div>

        {/* Logo */}
        <div className="text-center mb-10 mt-2">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl mb-6 shadow-lg shadow-red-600/30 transform rotate-3">
            <span className="text-white font-black italic text-4xl tracking-wider -rotate-3">F1</span>
          </div>
          <h1 className="text-3xl font-black italic uppercase text-white tracking-widest">Comedor</h1>
          <p className="text-red-500 font-bold uppercase tracking-widest text-xs mt-2 flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-red-600"></span>
            Paddock Access
            <span className="w-8 h-px bg-red-600"></span>
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Usuario Autorizado
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors font-mono uppercase"
              placeholder="Ingresa tu ID"
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Código de Seguridad
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors pr-12 font-mono"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-4 flex items-center text-slate-500 hover:text-red-500 focus:outline-none transition-colors"
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.543 7-4.477 0-8.268-2.943-9.543-7z" /></svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-black italic uppercase tracking-widest py-4 px-4 rounded-xl transition-all shadow-lg shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-red-700 mt-4 group"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                Iniciar Sistema
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Section */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-xs font-bold text-slate-500 text-center mb-4 uppercase tracking-widest">Perfiles de Pruebas</p>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleSelectUser('admin')}
              disabled={loading}
              className="bg-slate-950 hover:bg-slate-800 rounded-xl p-3 text-center transition-all shadow-sm disabled:opacity-50 border border-slate-800 hover:border-red-500 group"
            >
              <div className="w-8 h-8 bg-red-600/10 border border-red-500/30 rounded-full mx-auto mb-2 flex items-center justify-center group-hover:scale-110 group-hover:bg-red-600 transition-all">
                <span className="text-red-500 group-hover:text-white text-xs font-bold transition-colors">A</span>
              </div>
              <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider group-hover:text-white transition-colors">Admin</p>
            </button>
            <button
              type="button"
              onClick={() => handleSelectUser('supervisor')}
              disabled={loading}
              className="bg-slate-950 hover:bg-slate-800 rounded-xl p-3 text-center transition-all shadow-sm disabled:opacity-50 border border-slate-800 hover:border-emerald-500 group"
            >
              <div className="w-8 h-8 bg-emerald-600/10 border border-emerald-500/30 rounded-full mx-auto mb-2 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 transition-all">
                <span className="text-emerald-500 group-hover:text-white text-xs font-bold transition-colors">S</span>
              </div>
              <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider group-hover:text-white transition-colors">Sup</p>
            </button>
            <button
              type="button"
              onClick={() => handleSelectUser('cajero')}
              disabled={loading}
              className="bg-slate-950 hover:bg-slate-800 rounded-xl p-3 text-center transition-all shadow-sm disabled:opacity-50 border border-slate-800 hover:border-amber-500 group"
            >
              <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/30 rounded-full mx-auto mb-2 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 transition-all">
                <span className="text-amber-500 group-hover:text-white text-xs font-bold transition-colors">C</span>
              </div>
              <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider group-hover:text-white transition-colors">Cajero</p>
            </button>
          </div>
        </div>

        {/* BYPASS: Botón de acceso directo temporal */}
        {bypassMode ? null : (
          <div className="mt-6 text-center">
            <button
              onClick={handleBypassLogin}
              disabled={loading}
              className="text-slate-500 hover:text-red-400 font-bold text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              Bypass Forzado (DevMode)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
