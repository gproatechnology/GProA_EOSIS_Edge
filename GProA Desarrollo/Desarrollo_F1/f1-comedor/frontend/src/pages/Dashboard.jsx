import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts'
import { AppLayout, StatsCard, Card, Table, Badge, Button } from '@/components/AppLayout'
import { reportsAPI } from '@/services/api'
import toast from 'react-hot-toast'

// ============================================
// MOCK DATA PARA DEMO - PRESENTACIÓN EJECUTIVA
// ============================================
const USE_MOCK_DATA = true // Cambiar a false para datos reales

const MOCK_DATA = {
  stats: {
    data: {
      total_employees_today: 847,
      total_amount_today: 126850.00,
      breakfast_count: 234,
      lunch_count: 412,
      dinner_count: 201,
      employees_at_limit: 89,
      consumptions_by_hour: [
        { hour: '06:00', count: 12 }, { hour: '07:00', count: 45 }, { hour: '08:00', count: 78 },
        { hour: '09:00', count: 56 }, { hour: '10:00', count: 34 }, { hour: '11:00', count: 89 },
        { hour: '12:00', count: 156 }, { hour: '13:00', count: 198 }, { hour: '14:00', count: 167 },
        { hour: '15:00', count: 98 }, { hour: '16:00', count: 67 }, { hour: '17:00', count: 45 },
        { hour: '18:00', count: 78 }, { hour: '19:00', count: 92 }, { hour: '20:00', count: 54 },
        { hour: '21:00', count: 23 }, { hour: '22:00', count: 8 },
      ]
    }
  },
  company: {
    data: [
      { company_name: 'Grupo Bimbo', total_consumptions: 234, total_amount: 35100 },
      { company_name: 'Coca-Cola FEMSA', total_consumptions: 189, total_amount: 28350 },
      { company_name: 'Grupo Modelo', total_consumptions: 156, total_amount: 23400 },
      { company_name: 'Elektra', total_consumptions: 98, total_amount: 14700 },
      { company_name: 'Liverpool', total_consumptions: 87, total_amount: 13050 },
      { company_name: 'Sanborns', total_consumptions: 76, total_amount: 11400 },
      { company_name: 'OXXO', total_consumptions: 65, total_amount: 9750 },
      { company_name: 'Chedraui', total_consumptions: 54, total_amount: 8100 },
    ]
  },
  category: {
    data: [
      { category_name: 'Combo Ejecutivo', total_consumptions: 312, total_amount: 62400 },
      { category_name: 'Menú del Día', total_consumptions: 287, total_amount: 43100 },
      { category_name: 'A la Carta', total_consumptions: 156, total_amount: 15600 },
      { category_name: 'Buffet', total_consumptions: 92, total_amount: 5750 },
    ]
  },
  daily: {
    data: {
      recent_consumptions: [
        { time: '14:32', employee_name: 'Juan Pérez García', company_name: 'Grupo Bimbo', category_name: 'Combo Ejecutivo', meal_type: 'LUNCH', total: 200 },
        { time: '14:28', employee_name: 'María López Hernández', company_name: 'Coca-Cola FEMSA', category_name: 'Menú del Día', meal_type: 'LUNCH', total: 150 },
        { time: '14:15', employee_name: 'Carlos Sánchez Ruiz', company_name: 'Grupo Modelo', category_name: 'Combo Ejecutivo', meal_type: 'LUNCH', total: 200 },
        { time: '14:02', employee_name: 'Ana Martínez Torres', company_name: 'Elektra', category_name: 'A la Carta', meal_type: 'LUNCH', total: 100 },
        { time: '13:55', employee_name: 'Roberto Díaz Flores', company_name: 'Liverpool', category_name: 'Buffet', meal_type: 'LUNCH', total: 89 },
        { time: '13:48', employee_name: 'Laura González López', company_name: 'Sanborns', category_name: 'Menú del Día', meal_type: 'LUNCH', total: 150 },
        { time: '13:35', employee_name: 'Fernando Castillo', company_name: 'OXXO', category_name: 'Combo Ejecutivo', meal_type: 'LUNCH', total: 200 },
        { time: '13:22', employee_name: 'Patricia Romero', company_name: 'Chedraui', category_name: 'A la Carta', meal_type: 'LUNCH', total: 100 },
        { time: '13:10', employee_name: 'Miguel Ángel Torres', company_name: 'Grupo Bimbo', category_name: 'Menú del Día', meal_type: 'LUNCH', total: 150 },
        { time: '12:58', employee_name: 'Sofia Ramirez', company_name: 'Coca-Cola FEMSA', category_name: 'Combo Ejecutivo', meal_type: 'LUNCH', total: 200 },
        { time: '12:45', employee_name: 'David Herrera', company_name: 'Grupo Modelo', category_name: 'Buffet', meal_type: 'LUNCH', total: 89 },
        { time: '12:32', employee_name: 'Carmen Morales', company_name: 'Elektra', category_name: 'Menú del Día', meal_type: 'LUNCH', total: 150 },
        { time: '12:18', employee_name: 'Antonio Rivera', company_name: 'Liverpool', category_name: 'A la Carta', meal_type: 'LUNCH', total: 100 },
        { time: '12:05', employee_name: 'Isabel Castro', company_name: 'Sanborns', category_name: 'Combo Ejecutivo', meal_type: 'LUNCH', total: 200 },
        { time: '11:52', employee_name: 'José Luis Ortiz', company_name: 'OXXO', category_name: 'Menú del Día', meal_type: 'LUNCH', total: 150 },
      ]
    }
  }
}

// Iconos
const Icons = {
  Users: () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Currency: () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Clock: () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Alert: () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Download: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Chart: () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  TrendingUp: () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  Building: () => <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
}

// Colores para gráficos
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value || 0)
}

const formatNumber = (value) => {
  return new Intl.NumberFormat('es-MX').format(value || 0)
}

export default function Dashboard() {
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0])
  const navigate = useNavigate()

  // Scroll to top when component mounts or route changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [navigate])

  // Fetch dashboard stats - usa mock si está habilitado
  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => USE_MOCK_DATA ? Promise.resolve(MOCK_DATA.stats) : reportsAPI.dashboardStats(),
    refetchInterval: USE_MOCK_DATA ? false : 60000,
  })

  // Fetch consumptions by company
  const { data: companyData } = useQuery({
    queryKey: ['reportByCompany', dateFrom, dateTo],
    queryFn: () => USE_MOCK_DATA ? Promise.resolve(MOCK_DATA.company) : reportsAPI.byCompany({ date_from: dateFrom, date_to: dateTo }),
  })

  // Fetch consumptions by category
  const { data: categoryData } = useQuery({
    queryKey: ['reportByCategory', dateFrom, dateTo],
    queryFn: () => USE_MOCK_DATA ? Promise.resolve(MOCK_DATA.category) : reportsAPI.byCategory({ date_from: dateFrom, date_to: dateTo }),
  })

  // Fetch daily summary
  const { data: dailyData } = useQuery({
    queryKey: ['dailySummary', dateFrom],
    queryFn: () => USE_MOCK_DATA ? Promise.resolve(MOCK_DATA.daily) : reportsAPI.dailySummary({ date: dateFrom }),
  })

  const handleExport = async () => {
    try {
      const response = await reportsAPI.exportExcel({ date_from: dateFrom, date_to: dateTo })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `reporte_comedor_${dateFrom}_${dateTo}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Reporte exportado exitosamente')
    } catch (error) {
      toast.error('Error al exportar reporte')
    }
  }

  const dashboardData = stats?.data || {}
  const companyReport = companyData?.data || []
  const categoryReport = categoryData?.data || []
  const dailyInfo = dailyData?.data || {}

  // Prepare chart data
  const hourlyData = (dashboardData.consumptions_by_hour || []).map(item => ({
    hour: item.hour,
    consumo: item.count,
  }))

  const companyChartData = companyReport.slice(0, 8).map(item => ({
    name: item.company_name?.length > 15 ? item.company_name.substring(0, 15) + '...' : item.company_name || 'Sin empresa',
    consumos: item.total_consumptions || 0,
    monto: item.total_amount || 0,
    fullName: item.company_name,
  }))

  const categoryChartData = categoryReport.map(item => ({
    name: item.category_name || 'Sin categoría',
    value: item.total_consumptions || 0,
    amount: item.total_amount || 0,
  }))

  // Calculate percentages
  const totalCompanyConsumptions = companyReport.reduce((sum, c) => sum + (c.total_consumptions || 0), 0)
  const companyWithPercent = companyChartData.map(item => ({
    ...item,
    percentage: totalCompanyConsumptions > 0 ? ((item.consumos / totalCompanyConsumptions) * 100).toFixed(1) : 0
  }))

  // Table columns
  const tableColumns = [
    {
      header: 'Hora',
      accessor: 'time',
      render: (row) => <span className="font-mono text-slate-600">{row.time || '-'}</span>
    },
    {
      header: 'Empleado',
      accessor: 'employee_name',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800">{row.employee_name || '-'}</p>
        </div>
      )
    },
    {
      header: 'Empresa',
      accessor: 'company_name',
      render: (row) => (
        <Badge variant="info">{row.company_name || '-'}</Badge>
      )
    },
    {
      header: 'Categoría',
      accessor: 'category_name',
      render: (row) => <span className="text-slate-600">{row.category_name || '-'}</span>
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
      {/* Header Section */}
      <div className="bg-slate-900 rounded-xl p-6 mb-6 text-white border-l-8 border-red-600 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-10 -translate-y-10">
          <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z" /></svg>
        </div>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-wider">Paddock Central</h2>
            <p className="text-red-400 mt-1 font-semibold uppercase tracking-widest text-sm">Telemetría y Operaciones del Comedor</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-2">
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-300">Desde:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-white/20 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-300">Hasta:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-white/20 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/50"
              />
            </div>
            <Button
              icon={Icons.Download}
              onClick={handleExport}
              variant="success"
            >
              Exportar
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Access Buttons */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            icon={Icons.Scanner}
            onClick={() => navigate('/scanner')}
            variant="success"
            className="flex-1 flex items-center justify-center px-6 py-4 text-lg font-bold transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            Scanner QR
          </Button>
          <Button
            icon={Icons.Monitor}
            onClick={() => navigate('/monitor')}
            variant="primary"
            className="flex-1 flex items-center justify-center px-6 py-4 text-lg font-bold transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            Monitor en Vivo
          </Button>
          <Button
            icon={Icons.Admin}
            onClick={() => navigate('/admin')}
            variant="danger"
            className="flex-1 flex items-center justify-center px-6 py-4 text-lg font-bold transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            Administración
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Comensales Hoy"
          value={formatNumber(dashboardData.total_employees_today || 0)}
          subtitle="Empleados registrados"
          icon={Icons.Users}
          color="gray"
          trend="up"
          trendValue="+12% vs ayer"
        />
        <StatsCard
          title="Ingresos del Día"
          value={formatCurrency(dashboardData.total_amount_today)}
          subtitle="Monto total facturado"
          icon={Icons.Currency}
          color="red"
          trend="up"
          trendValue="+8% vs ayer"
        />
        <StatsCard
          title="Consumos por Turno"
          value={`D: ${dashboardData.breakfast_count || 0} | C: ${dashboardData.lunch_count || 0} | Ce: ${dashboardData.dinner_count || 0}`}
          subtitle="Desayuno / Comida / Cena"
          icon={Icons.Clock}
          color="gray"
        />
        <StatsCard
          title="Límite Alcanzado"
          value={dashboardData.employees_at_limit || 0}
          subtitle="Aviso de operaciones"
          icon={Icons.Alert}
          color="amber"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Hourly Chart */}
        <div className="lg:col-span-2">
          <Card title="📈 Consumos por Hora" className="h-full">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorConsumo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="hour" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="consumo"
                    stroke="#dc2626"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorConsumo)"
                    name="Consumos"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Category Pie Chart */}
        <div className="lg:col-span-1">
          <Card title="🍽️ Por Categoría" className="h-full">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px'
                    }}
                    formatter={(value, name) => [formatNumber(value), name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Company Bar Chart */}
        <Card title="🏢 Consumos por Empresa" className="h-full">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyWithPercent} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px'
                  }}
                  formatter={(value, name) => [formatNumber(value), name === 'consumos' ? 'Consumos' : 'Monto']}
                  labelFormatter={(label) => `Empresa: ${label}`}
                />
                <Bar dataKey="consumos" fill="#10b981" radius={[0, 4, 4, 0]} name="Consumos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Summary Stats */}
        <Card title="📊 Resumen Ejecutivo" className="h-full">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border-l-4 border-red-600 shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                  <Icons.Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Total Empresas</p>
                  <p className="text-2xl font-black italic text-white">{companyReport.length}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400 capitalize">Promedio por empresa</p>
                <p className="text-lg font-bold text-white">
                  {companyReport.length > 0 ? formatNumber(Math.round(totalCompanyConsumptions / companyReport.length)) : 0}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border-l-4 border-emerald-500 shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                  <Icons.TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Ticket Promedio</p>
                  <p className="text-2xl font-black italic text-white">
                    {dashboardData.total_employees_today > 0
                      ? formatCurrency(dashboardData.total_amount_today / dashboardData.total_employees_today)
                      : formatCurrency(0)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400 capitalize">Categorías</p>
                <p className="text-lg font-bold text-white">{categoryReport.length}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border-l-4 border-amber-500 shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Icons.Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Hora Pico</p>
                  <p className="text-2xl font-black italic text-white">
                    {hourlyData.length > 0
                      ? `${hourlyData.reduce((a, b) => a.consumo > b.consumo ? a : b).hour}:00`
                      : '--:--'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Consumos en hora pico</p>
                <p className="text-lg font-semibold text-slate-800">
                  {hourlyData.length > 0 ? formatNumber(Math.max(...hourlyData.map(h => h.consumo))) : 0}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Consumptions Table */}
      <Card
        title="📋 Últimos Consumos"
        action={
          <span className="text-sm text-slate-500">
            Mostrando últimos 20 registros
          </span>
        }
      >
        <Table
          columns={tableColumns}
          data={(dailyInfo.recent_consumptions || []).slice(0, 20)}
        />
      </Card>
    </AppLayout>
  )
}
