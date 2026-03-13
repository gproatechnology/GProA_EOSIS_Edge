import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { companiesAPI, categoriesAPI, employeesAPI, menuItemsAPI } from '@/services/api'
import toast from 'react-hot-toast'

// Componente Navbar
function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-slate-900 shadow-md border-b-4 border-red-600 px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors group flex items-center gap-2 font-semibold shadow-sm border border-slate-700"
            title="Volver al inicio"
          >
            <svg className="w-5 h-5 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="hidden sm:inline">Pit Wall</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg shadow-inner">
              <span className="text-white font-black italic tracking-wider">F1</span>
            </div>
            <div>
              <h1 className="text-xl font-black italic uppercase text-white tracking-widest leading-none">Comedor</h1>
              <p className="text-xs font-bold text-red-500 uppercase tracking-widest mt-1">Directorio Central</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4 border-l border-slate-700 pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white uppercase tracking-wider">{user?.username}</p>
            <p className="text-xs font-bold text-red-500 uppercase tracking-widest">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-10 h-10 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white transition-colors rounded-lg flex items-center justify-center border border-slate-700"
            title="Cerrar sesión"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}

// Modal Component
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState('employees')
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({})
  const queryClient = useQueryClient()

  const tabs = [
    { id: 'employees', label: 'Empleados', icon: '👥' },
    { id: 'companies', label: 'Empresas', icon: '🏢' },
    { id: 'categories', label: 'Categorías', icon: '📁' },
    { id: 'menu', label: 'Menú', icon: '🍽️' },
  ]

  // Fetch data based on active tab
  const { data: employeesData, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees', searchTerm],
    queryFn: () => employeesAPI.getAll({ search: searchTerm, limit: 100 }),
    enabled: activeTab === 'employees',
  })

  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companiesAPI.getAll(),
    enabled: activeTab === 'companies',
  })

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll(),
    enabled: activeTab === 'categories',
  })

  const { data: menuItemsData, isLoading: menuItemsLoading } = useQuery({
    queryKey: ['menuItems'],
    queryFn: () => menuItemsAPI.getAll({ limit: 100 }),
    enabled: activeTab === 'menu',
  })

  // Mutations
  const createEmployee = useMutation({
    mutationFn: (data) => employeesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['employees'])
      toast.success('✅ Empleado creado')
      setIsModalOpen(false)
      setFormData({})
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Error al crear empleado')
    },
  })

  const createCompany = useMutation({
    mutationFn: (data) => companiesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['companies'])
      toast.success('✅ Empresa creada')
      setIsModalOpen(false)
      setFormData({})
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Error al crear empresa')
    },
  })

  const createCategory = useMutation({
    mutationFn: (data) => categoriesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories'])
      toast.success('✅ Categoría creada')
      setIsModalOpen(false)
      setFormData({})
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Error al crear categoría')
    },
  })

  const createMenuItem = useMutation({
    mutationFn: (data) => menuItemsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['menuItems'])
      toast.success('✅ Platillo creado')
      setIsModalOpen(false)
      setFormData({})
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Error al crear platillo')
    },
  })

  const deleteEmployee = useMutation({
    mutationFn: (id) => employeesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['employees'])
      toast.success('✅ Empleado eliminado')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Error al eliminar empleado')
    },
  })

  const deleteCompany = useMutation({
    mutationFn: (id) => companiesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['companies'])
      toast.success('✅ Empresa eliminada')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Error al eliminar empresa')
    },
  })

  const deleteCategory = useMutation({
    mutationFn: (id) => categoriesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories'])
      toast.success('✅ Categoría eliminada')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Error al eliminar categoría')
    },
  })

  const deleteMenuItem = useMutation({
    mutationFn: (id) => menuItemsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['menuItems'])
      toast.success('✅ Platillo eliminado')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Error al eliminar platillo')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    switch (activeTab) {
      case 'employees':
        createEmployee.mutate(formData)
        break
      case 'companies':
        createCompany.mutate(formData)
        break
      case 'categories':
        createCategory.mutate(formData)
        break
      case 'menu':
        createMenuItem.mutate(formData)
        break
    }
  }

  const handleDelete = (id) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return
    switch (activeTab) {
      case 'employees':
        deleteEmployee.mutate(id)
        break
      case 'companies':
        deleteCompany.mutate(id)
        break
      case 'categories':
        deleteCategory.mutate(id)
        break
      case 'menu':
        deleteMenuItem.mutate(id)
        break
    }
  }

  const getModalFields = () => {
    switch (activeTab) {
      case 'employees':
        return [
          { name: 'employee_number', label: 'Número de Empleado', type: 'text', required: true },
          { name: 'first_name', label: 'Nombre', type: 'text', required: true },
          { name: 'last_name', label: 'Apellido', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'phone', label: 'Teléfono', type: 'text' },
          { name: 'company_id', label: 'Empresa ID', type: 'number', required: true },
          { name: 'category_id', label: 'Categoría ID', type: 'number', required: true },
        ]
      case 'companies':
        return [
          { name: 'name', label: 'Nombre', type: 'text', required: true },
          { name: 'code', label: 'Código', type: 'text', required: true },
        ]
      case 'categories':
        return [
          { name: 'name', label: 'Nombre', type: 'text', required: true },
          { name: 'daily_limit', label: 'Límite Diario', type: 'number', required: true },
          { name: 'credit_limit', label: 'Límite de Crédito', type: 'number', required: true },
        ]
      case 'menu':
        return [
          { name: 'name', label: 'Nombre', type: 'text', required: true },
          { name: 'price', label: 'Precio', type: 'number', required: true },
          { name: 'meal_type', label: 'Tipo de Comida', type: 'select', options: [
            { value: 'BREAKFAST', label: 'Desayuno' },
            { value: 'LUNCH', label: 'Comida' },
            { value: 'DINNER', label: 'Cena' },
          ]},
        ]
      default:
        return []
    }
  }

  const employees = employeesData?.data?.items || []
  const companies = companiesData?.data?.items || []
  const categories = categoriesData?.data?.items || []
  const menuItems = menuItemsData?.data?.items || []

  const isLoading = employeesLoading || companiesLoading || categoriesLoading || menuItemsLoading

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 border-l-4 border-red-600">
          <h2 className="text-2xl font-black italic text-slate-900 tracking-wide uppercase">Registro Base</h2>
          <p className="text-gray-500 font-semibold uppercase tracking-wider text-sm mt-1">Configuración y Mantenimiento de Datos</p>
        </div>

        {/* Tabs */}
        <div className="bg-white flex rounded-xl border border-slate-200 overflow-hidden mb-8 shadow-sm p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search and Add Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => {
              setEditingItem(null)
              setFormData({})
              setIsModalOpen(true)
            }}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold uppercase tracking-widest text-sm shadow-md border border-red-800 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Registro
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Employees Table */}
              {activeTab === 'employees' && (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Número</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Nombre</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Empresa</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Categoría</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">QR</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{emp.employee_number}</td>
                        <td className="px-4 py-3">{emp.first_name} {emp.last_name}</td>
                        <td className="px-4 py-3">{emp.email}</td>
                        <td className="px-4 py-3">{emp.company?.name || '-'}</td>
                        <td className="px-4 py-3">{emp.category?.name || '-'}</td>
                        <td className="px-4 py-3 font-mono text-xs">{emp.qr_code}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDelete(emp.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {employees.length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                          No hay empleados registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* Companies Table */}
              {activeTab === 'companies' && (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Código</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Nombre</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Estado</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {companies.map((company) => (
                      <tr key={company.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono">{company.code}</td>
                        <td className="px-4 py-3">{company.name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${company.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {company.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDelete(company.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {companies.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                          No hay empresas registradas
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* Categories Table */}
              {activeTab === 'categories' && (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Nombre</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Límite Diario</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Límite Crédito</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{cat.name}</td>
                        <td className="px-4 py-3">{cat.daily_limit}</td>
                        <td className="px-4 py-3">${cat.credit_limit}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {categories.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                          No hay categorías registradas
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* Menu Items Table */}
              {activeTab === 'menu' && (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Nombre</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Precio</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Tipo</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {menuItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{item.name}</td>
                        <td className="px-4 py-3">${item.price}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.meal_type === 'BREAKFAST' ? 'bg-yellow-100 text-yellow-800' :
                            item.meal_type === 'LUNCH' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {item.meal_type === 'BREAKFAST' ? 'Desayuno' :
                             item.meal_type === 'LUNCH' ? 'Comida' : 'Cena'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {menuItems.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                          No hay platillos en el menú
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={tabs.find(t => t.id === activeTab)?.label}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {getModalFields().map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.required && <span className="text-red-500"> *</span>}
              </label>
              {field.type === 'select' ? (
                <select
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required={field.required}
                >
                  <option value="">Seleccionar...</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required={field.required}
                />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
