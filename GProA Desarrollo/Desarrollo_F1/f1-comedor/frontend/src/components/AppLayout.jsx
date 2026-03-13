import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

// Iconos SVG
const Icons = {
  Home: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Scanner: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
    </svg>
  ),
  Monitor: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Admin: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Bell: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
}

export function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Icons.Dashboard, roles: ['ADMIN'] },
    { path: '/scanner', label: 'Scanner QR', icon: Icons.Scanner, roles: ['ADMIN', 'CASHIER'] },
    { path: '/monitor', label: 'Monitor en Vivo', icon: Icons.Monitor, roles: ['ADMIN', 'SUPERVISOR'] },
    { path: '/admin', label: 'Administración', icon: Icons.Admin, roles: ['ADMIN'] },
  ]

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-slate-900 border-r border-red-600/30">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8 px-2">
            {sidebarOpen && (
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/40">
                  <span className="text-white font-black text-xl italic tracking-wider">F1</span>
                </div>
                <div className="ml-3">
                  <h1 className="text-white font-black text-lg uppercase tracking-wide">Comedor</h1>
                  <p className="text-xs text-red-400 font-semibold tracking-widest uppercase">Paddock Club</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <Icons.Menu />
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {filteredMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-3 rounded-xl transition-all duration-300 group ${
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/40 border-l-4 border-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white border-l-4 border-transparent hover:border-red-500'
                }`}
              >
                <span className={location.pathname === item.path ? 'text-white' : 'text-slate-400 group-hover:text-white'}>
                  <item.icon />
                </span>
                {sidebarOpen && (
                  <span className="ml-3 font-medium">{item.label}</span>
                )}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="absolute bottom-4 left-0 right-0 px-3">
            <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
              {sidebarOpen && (
                <div className="flex items-center">
                  <div className="w-9 h-9 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center shadow-inner">
                    <span className="text-red-400 text-sm font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{user?.username}</p>
                    <p className="text-xs text-slate-400">{user?.role}</p>
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                title="Cerrar sesión"
              >
                <Icons.Logout />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Header */}
        <header className="bg-white/90 backdrop-blur-md border-b-2 border-red-600 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              {location.pathname !== '/dashboard' && (
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 rounded-lg transition-colors group flex items-center gap-2 font-semibold shadow-sm border border-slate-200"
                  title="Volver al inicio"
                >
                  <Icons.Home />
                  <span className="hidden sm:inline">Pit Wall (Inicio)</span>
                </button>
              )}
              <div>
                <h2 className="text-2xl font-black italic text-slate-900 tracking-tight uppercase">
                  {filteredMenuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                </h2>
                <p className="text-sm font-medium text-red-600 tracking-wider uppercase">
                  {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <Icons.Bell />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="hidden md:flex items-center gap-3 pl-4 border-l-2 border-slate-200">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 uppercase tracking-wide">{user?.username}</p>
                  <p className="text-xs font-semibold text-red-600 uppercase tracking-widest">{user?.role}</p>
                </div>
                <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center border-2 border-red-600 shadow-md">
                  <span className="text-white font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

// Enterprise Stats Card
export function StatsCard({ title, value, subtitle, icon: Icon, color = 'red', trend, trendValue }) {
  const colorClasses = {
    blue: 'from-blue-600 to-blue-800 bg-blue-500/10 text-blue-600',
    red: 'from-red-600 to-red-800 bg-red-600/10 text-red-600',
    gray: 'from-slate-700 to-slate-900 bg-slate-500/10 text-slate-800',
    emerald: 'from-emerald-600 to-emerald-800 bg-emerald-500/10 text-emerald-600',
    amber: 'from-amber-500 to-orange-600 bg-amber-500/10 text-amber-600',
  }

  const iconBgClasses = {
    blue: 'from-blue-600 to-slate-800',
    red: 'from-red-600 to-red-800',
    gray: 'from-slate-700 to-slate-900',
    emerald: 'from-emerald-500 to-green-700',
    amber: 'from-amber-500 to-orange-600',
  }

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200/60 p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transform group-hover:scale-110 transition-transform duration-500"></div>
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
          <p className="text-3xl font-black italic text-slate-900 tracking-tight">{value}</p>
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
              <svg className={`w-4 h-4 mr-1 ${trend === 'down' && 'rotate-180'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${iconBgClasses[color]} flex items-center justify-center shadow-lg flex-shrink-0`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  )
}

// Enterprise Card
export function Card({ children, className = '', title, action }) {
  return (
    <div className={`bg-white rounded-xl shadow-md border-t-4 border-t-red-600 border-x border-b border-slate-200 overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          {title && <h3 className="text-lg font-black italic uppercase text-slate-800 tracking-wide">{title}</h3>}
          {action}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}

// ============================================
// F1 Racing Stats Card - Telemetry Dashboard
// ============================================
export function F1StatsCard({ title, value, subtitle, trend, trendValue, icon: Icon, type = 'default' }) {
  // F1 Racing color schemes based on card type - Professional dark theme
  const typeConfig = {
    default: {
      accentColor: '#FF3B3B',
      iconBg: 'from-red-600 to-red-800',
      iconGlow: 'shadow-[0_0_15px_rgba(255,59,59,0.6)]'
    },
    revenue: {
      accentColor: '#00D084',
      iconBg: 'from-emerald-600 to-green-700',
      iconGlow: 'shadow-[0_0_15px_rgba(0,208,132,0.6)]'
    },
    consumption: {
      accentColor: '#FF9F1A',
      iconBg: 'from-amber-500 to-orange-600',
      iconGlow: 'shadow-[0_0_15px_rgba(255,159,26,0.6)]'
    },
    alert: {
      accentColor: '#FF453A',
      iconBg: 'from-red-600 to-rose-700',
      iconGlow: 'shadow-[0_0_15px_rgba(255,69,58,0.6)]'
    }
  }

  const config = typeConfig[type] || typeConfig.default

  return (
    <div 
      className="rounded-xl p-5 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
      style={{
        background: 'linear-gradient(145deg, #0f172a, #111827)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderTop: `3px solid ${config.accentColor}`
      }}
    >
      {/* Carbon fiber texture effect */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)' }}></div>
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-12 -mt-12 transform group-hover:scale-110 transition-transform duration-500"></div>
      
      <div className="flex items-start justify-between relative z-10 gap-4">
        <div className="flex-1 min-w-0">
          {/* Title - #C9D1D9 */}
          <p className="text-xs font-semibold tracking-widest mb-1" style={{ color: '#C9D1D9' }}>{title}</p>
          {/* Value - #FFFFFF */}
          <p className="text-2xl font-bold tracking-tight truncate" style={{ color: '#FFFFFF' }}>{value}</p>
          {/* Subtitle - #8B949E */}
          {subtitle && <p className="text-xs mt-1 font-medium" style={{ color: '#8B949E' }}>{subtitle}</p>}
          {/* Trend - #00E676 */}
          {trend && trendValue && (
            <div className="flex items-center mt-2 text-xs">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#00E676' }}>
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold font-mono" style={{ color: '#00E676' }}>{trendValue}</span>
            </div>
          )}
        </div>
        {/* Icon container with fixed width to prevent text overlap */}
        <div 
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.iconBg} flex items-center justify-center flex-shrink-0`}
          style={{ boxShadow: config.iconGlow }}
        >
          {Icon && <Icon className="w-6 h-6 text-white" />}
        </div>
      </div>
    </div>
  )
}
  )
}

// Enterprise Table
export function Table({ columns, data, onRowClick }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {data.map((row, rowIdx) => (
            <tr 
              key={rowIdx} 
              className={`hover:bg-slate-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="px-6 py-4 text-sm text-slate-600">
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400">
                No hay datos disponibles
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// Badge Component
export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    purple: 'bg-slate-800 text-white border border-slate-900', // Used for DINNER as 'racing dark'
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

// Empty State
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 text-center max-w-sm mb-4">{description}</p>
      {action}
    </div>
  )
}

// Loading Spinner
export function LoadingSpinner({ size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={`${sizes[size]} border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin`}></div>
  )
}

// Button Component
export function Button({ children, variant = 'primary', className = '', icon: Icon, ...props }) {
  const variants = {
    primary: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-md shadow-red-600/30 border border-red-800 uppercase tracking-wider font-bold text-sm',
    secondary: 'bg-slate-800 text-white hover:bg-slate-900 shadow-md border border-slate-900 uppercase tracking-wider font-bold text-sm',
    success: 'bg-gradient-to-r from-slate-800 to-slate-900 text-white border-l-4 border-emerald-500 hover:bg-slate-700 shadow-md uppercase tracking-wider font-bold text-sm',
    danger: 'bg-gradient-to-r from-red-600 to-red-800 text-white hover:from-red-700 hover:to-red-900 uppercase tracking-wider font-bold text-sm',
  }

  return (
    <button 
      className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover:shadow-lg ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5 mr-2" />}
      {children}
    </button>
  )
}
