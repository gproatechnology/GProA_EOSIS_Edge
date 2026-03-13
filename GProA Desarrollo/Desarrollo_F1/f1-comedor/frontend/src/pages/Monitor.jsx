import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { AppLayout, StatsCard, Card, Table, Badge, Button } from '@/components/AppLayout'
import { reportsAPI, consumptionsAPI } from '@/services/api'
import toast from 'react-hot-toast'

// ============================================
// MOCK DATA PARA DEMO - PRESENTACIÓN EJECUTIVA
// ============================================
const USE_MOCK_DATA = true

const MOCK_STATS = {
  data: {
    total_employees_today: 847,
    total_amount_today: 126850.00,
    breakfast_count: 234,
    lunch_count: 412,
    dinner_count: 201,
    employees_at_limit: 89,
    consumptions_by_hour: [
      { hour: '06:00', count: 12 },{ hour: '07:00', count: 45 },{ hour: '08:00', count: 78 },
      { hour: '09:00', count: 56 },{ hour: '10:00', count: 34 },{ hour: '11:00', count: 89 },
      { hour: '12:00', count: 156 },{ hour: '13:00', count: 198 },{ hour: '14:00', count: 167 },
      { hour: '15:00', count: 98 },{ hour: '16:00', count: 67 },{ hour: '17:00', count: 45 },
      { hour: '18:00', count: 78 },{ hour: '19:00', count: 92 },{ hour: '20:00', count: 54 },
      { hour: '21:00', count: 23 },{ hour: '22:00', count: 8 },
    ]
  }
}

const MOCK_RECENT = {
  data: {
    items: [
      { id: 1, created_at: new Date().toISOString(), employee: { first_name: 'Juan', last_name: 'Pérez García', company: { name: 'Grupo Bimbo' } }, meal_type: 'LUNCH', total: 200 },
      { id: 2, created_at: new Date(Date.now() - 120000).toISOString(), employee: { first_name: 'María', last_name: 'López Hernández', company: { name: 'Coca-Cola FEMSA' } }, meal_type: 'LUNCH', total: 150 },
      { id: 3, created_at: new Date(Date.now() - 300000).toISOString(), employee: { first_name: 'Carlos', last_name: 'Sánchez Ruiz', company: { name: 'Grupo Modelo' } }, meal_type: 'LUNCH', total: 200 },
      { id: 4, created_at: new Date(Date.now() - 480000).toISOString(), employee: { first_name: 'Ana', last_name: 'Martínez Torres', company: { name: 'Elektra' } }, meal_type: 'LUNCH', total: 100 },
      { id: 5, created_at: new Date(Date.now() - 600000).toISOString(), employee: { first_name: 'Roberto', last_name: 'Díaz Flores', company: { name: 'Liverpool' } }, meal_type: 'LUNCH', total: 89 },
      { id: 6, created_at: new Date(Date.now() - 720000).toISOString(), employee: { first_name: 'Laura', last_name: 'González López', company: { name: 'Sanborns' } }, meal_type: 'LUNCH', total: 150 },
      { id: 7, created_at: new Date(Date.now() - 840000).toISOString(), employee: { first_name: 'Fernando', last_name: 'Castillo', company: { name: 'OXXO' } }, meal_type: 'LUNCH', total: 200 },
      { id: 8, created_at: new Date(Date.now() - 960000).toISOString(), employee: { first_name: 'Patricia', last_name: 'Romero', company: { name: 'Chedraui' } }, meal_type: 'LUNCH', total: 100 },
      { id: 9, created_at: new Date(Date.now() - 1080000).toISOString(), employee: { first_name: 'Miguel', last_name: 'Ángel Torres', company: { name: 'Grupo Bimbo' } }, meal_type: 'LUNCH', total: 150 },
      { id: 10, created_at: new Date(Date.now() - 1200000).toISOString(), employee: { first_name: 'Sofia', last_name: 'Ramirez', company: { name: 'Coca-Cola FEMSA' } }, meal_type: 'LUNCH', total: 200 },
    ]
  }
}

// Iconos
const Icons = {
  Users: () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Currency: () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Clock: () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Refresh: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  Sun: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Moon: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  SunAndMoon: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Alert: () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Live: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value || 0)
}

const formatNumber = (value) => {
  return new Intl.NumberFormat('es-MX').format(value || 0)
}

export default function Monitor() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [lastUpdate, setLastUpdate] = useState(null)

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch real-time stats (auto-refresh every 30 seconds)
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => USE_MOCK_DATA ? Promise.resolve(MOCK_STATS) : reportsAPI.dashboardStats(),
    refetchInterval: USE_MOCK_DATA ? false : 30000,
  })

  // Fetch recent consumptions
  const { data: recentData, refetch: refetchRecent } = useQuery({
    queryKey: ['recentConsumptions'],
    queryFn: () => {
      if (USE_MOCK_DATA) return Promise.resolve(MOCK_RECENT)
      const today = new Date().toISOString().split('T')[0]
      return consumptionsAPI.getAll({ date_from: today, date_to: today, limit: 50 })
    },
    refetchInterval: USE_MOCK_DATA ? false : 30000,
  })

  // Manual refresh
  const handleRefresh = () => {
    refetchStats()
    refetchRecent()
    setLastUpdate(new Date())
    toast.success('Datos actualizados')
  }

  const dashboardData = stats?.data || {}
  const recentConsumptions = recentData?.data?.items || []

  // Find last consumption time
  const lastConsumption = recentConsumptions[0]
  const lastConsumptionTime = lastConsumption?.created_at 
    ? new Date(lastConsumption.created_at) 
    : null
  
  const minutesSinceLastConsumption = lastConsumptionTime
    ? Math.floor((currentTime - lastConsumptionTime) / 60000)
    : null

  // Prepare hourly chart data
  const hourlyData = (dashboardData.consumptions_by_hour || []).map(item => ({
    hour: item.hour,
    consumo: item.count,
  }))

  // Alerts
  const alerts = []
  
  if (minutesSinceLastConsumption !== null && minutesSinceLastConsumption > 30) {
    alerts.push({
      type: 'warning',
      title: 'Inactividad Detectada',
      message: `Último consumo hace ${minutesSinceLastConsumption} minutos`,
      icon: Icons.Clock
    })
  }

  if (dashboardData.employees_at_limit > 0) {
    alerts.push({
      type: 'info',
      title: 'Límite Alcanzado',
      message: `${dashboardData.employees_at_limit} empleados han alcanzado su límite diario`,
      icon: Icons.Alert
    })
  }

  // Calculate current shift
  const getCurrentShift = () => {
    const hour = currentTime.getHours()
    if (hour >= 6 && hour < 11) return { name: 'Desayuno', icon: Icons.Sun, color: 'amber', bg: 'from-amber-500 to-orange-500' }
    if (hour >= 11 && hour < 16) return { name: 'Comida', icon: Icons.SunAndMoon, color: 'emerald', bg: 'from-emerald-500 to-teal-500' }
    return { name: 'Cena', icon: Icons.Moon, color: 'purple', bg: 'from-purple-500 to-indigo-500' }
  }

  const currentShift = getCurrentShift()

  // Table columns
  const tableColumns = [
    { 
      header: 'Hora', 
      accessor: 'created_at',
      render: (row) => (
        <span className="font-mono text-slate-600">
          {row.created_at ? new Date(row.created_at).toLocaleTimeString('es-MX') : '-'}
        </span>
      )
    },
    { 
      header: 'Empleado', 
      accessor: 'employee',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800">
            {row.employee?.first_name} {row.employee?.last_name}
          </p>
        </div>
      )
    },
    { 
      header: 'Empresa', 
      accessor: 'company',
      render: (row) => (
        <Badge variant="info">{row.employee?.company?.name || '-'}</Badge>
      )
    },
    { 
      header: 'Turno', 
      accessor: 'meal_type',
      render: (row) => {
        const variants = {
          'BREAKFAST': 'warning',
          'LUNCH': 'success',
          'DINNER': 'purple'
        }
        const labels = {
          'BREAKFAST': 'Desayuno',
          'LUNCH': 'Comida',
          'DINNER': 'Cena'
        }
        return <Badge variant={variants[row.meal_type] || 'default'}>{labels[row.meal_type] || row.meal_type}</Badge>
      }
    },
    { 
      header: 'Monto', 
      accessor: 'total',
      render: (row) => <span className="font-semibold text-emerald-600">{formatCurrency(row.total)}</span>
    },
  ]

  return (
    <AppLayout>
      {/* Live Status Header */}
      <div className="bg-slate-900 rounded-2xl p-6 mb-6 border-l-8 border-red-600 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-10 -translate-y-10">
          <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/></svg>
        </div>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/40">
                <Icons.Live className="w-8 h-8 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-slate-900 rounded-full animate-pulse"></span>
            </div>
            <div>
              <h2 className="text-3xl font-black italic uppercase text-white tracking-wider">Telemetría en Vivo</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex items-center text-red-500 text-sm font-bold uppercase tracking-widest">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                  Conectado al Pit Wall
                </span>
                <span className="text-slate-600 px-2">|</span>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  Ping 30s
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Current Time */}
            <div className="text-right">
              <p className="text-sm text-slate-400">Hora Actual</p>
              <p className="text-3xl font-bold text-white font-mono">
                {currentTime.toLocaleTimeString('es-MX')}
              </p>
            </div>
            
            {/* Current Shift Badge */}
            <div className={`px-4 py-2 bg-gradient-to-r ${currentShift.bg} rounded-xl flex items-center gap-2 shadow-lg`}>
              <currentShift.icon className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">{currentShift.name}</span>
            </div>

            {/* Refresh Button */}
            <Button icon={Icons.Refresh} onClick={handleRefresh}>
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {alerts.map((alert, index) => (
            <div 
              key={index}
              className={`p-4 rounded-xl border flex items-start gap-4 ${
                alert.type === 'warning' 
                  ? 'bg-amber-50 border-amber-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                alert.type === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
              }`}>
                <alert.icon className={`w-5 h-5 ${
                  alert.type === 'warning' ? 'text-amber-600' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <p className={`font-semibold ${
                  alert.type === 'warning' ? 'text-amber-800' : 'text-blue-800'
                }`}>
                  {alert.title}
                </p>
                <p className={`text-sm ${
                  alert.type === 'warning' ? 'text-amber-600' : 'text-blue-600'
                }`}>
                  {alert.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Comensales Hoy"
          value={formatNumber(dashboardData.total_employees_today || 0)}
          subtitle="Empleados registrados"
          icon={Icons.Users}
          color="gray"
        />
        <StatsCard
          title="Ingresos del Día"
          value={formatCurrency(dashboardData.total_amount_today)}
          subtitle="Monto total"
          icon={Icons.Currency}
          color="red"
        />
        <StatsCard
          title="Último Consumo"
          value={minutesSinceLastConsumption !== null ? `${minutesSinceLastConsumption} min` : 'Sin datos'}
          subtitle="Tiempo transcurrido"
          icon={Icons.Clock}
          color={minutesSinceLastConsumption !== null && minutesSinceLastConsumption > 15 ? 'amber' : 'gray'}
        />
        <StatsCard
          title="Ticket Promedio"
          value={dashboardData.total_employees_today > 0 
            ? formatCurrency(dashboardData.total_amount_today / dashboardData.total_employees_today)
            : formatCurrency(0)}
          subtitle="Por comensal"
          icon={Icons.Currency}
          color="cyan"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Hourly Chart */}
        <div className="lg:col-span-2">
          <Card title="📈 Consumos por Hora" className="h-full">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorConsumoLive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="hour" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px'
                    }}
                    formatter={(value) => [formatNumber(value), 'Consumos']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="consumo" 
                    stroke="#dc2626" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorConsumoLive)" 
                    name="Consumos"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Shift Stats */}
        <div className="lg:col-span-1">
          <Card title="🍽️ Consumos por Turno" className="h-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Icons.Sun className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Desayuno</p>
                    <p className="text-xs text-slate-500">6:00 - 11:00</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-amber-600">{dashboardData.breakfast_count || 0}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <Icons.SunAndMoon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Comida</p>
                    <p className="text-xs text-slate-500">11:00 - 16:00</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-emerald-600">{dashboardData.lunch_count || 0}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <Icons.Moon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Cena</p>
                    <p className="text-xs text-slate-500">16:00 - 23:00</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-purple-600">{dashboardData.dinner_count || 0}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Consumptions Table */}
      <Card 
        title="📋 Últimas Entradas" 
        action={
          <span className="flex items-center gap-2 text-sm text-red-600 font-bold uppercase tracking-wider">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
            En vivo
          </span>
        }
      >
        <Table 
          columns={tableColumns} 
          data={recentConsumptions} 
        />
      </Card>
    </AppLayout>
  )
}
