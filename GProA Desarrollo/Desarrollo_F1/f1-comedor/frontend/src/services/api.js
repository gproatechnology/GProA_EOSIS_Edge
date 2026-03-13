import axios from 'axios'

// compute base URL for API requests
// Prefer explicit VITE_API_URL (set in .env or docker-compose), otherwise
// fall back to a relative path so that the browser talks to the same origin.
const API_URL = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : ''

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Timeout configuration (10 seconds)
  timeout: 10000,
  // Retry configuration
  retry: 3,
  retryDelay: 1000,
})

// Axios retry interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config
    
    // If no config or already retried, reject
    if (!config || config.__retryCount >= config.retry) {
      return Promise.reject(error)
    }
    
    // Only retry on network errors or 5xx errors
    if (!error.response || error.response.status >= 500) {
      config.__retryCount = config.__retryCount || 0
      config.__retryCount += 1
      
      console.warn(`Retrying request (${config.__retryCount}/${config.retry})...`)
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, config.retryDelay))
      
      return api(config)
    }
    
    return Promise.reject(error)
  }
)

// Interceptor para agregar el token en cada request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    // BYPASS: Enviar tokens de bypass al backend para validación
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    // Optional: Log successful requests in dev mode
    if (import.meta.env.DEV) {
      console.log(`[F1 SYSTEM] 🟢 HTTP ${response.status} | ${response.config.method.toUpperCase()} ${response.config.url}`)
    }
    return response
  },
  (error) => {
    const token = localStorage.getItem('token')
    
    // ============================================
    // CENTRALIZED ERROR LOGGING (PHASE 8)
    // ============================================
    if (error.response) {
      console.error(
        `[F1 SYSTEM ERROR] 🔴 HTTP ${error.response.status} | ${error.config.method.toUpperCase()} ${error.config.url}\n`,
        `Payload:`, error.response.data, '\n',
        `Stack:`, error.stack
      )
    } else {
      console.error(
        `[F1 SYSTEM NETWORK ERROR] 🔴 Endpoint unreachable or Timeout\n`,
        `Message:`, error.message, '\n',
        `Stack:`, error.stack
      )
    }
    
    // BYPASS: Si es un token de bypass, no hacer logout automático
    // ya que el backend procesa estos tokens specially
    if (token?.startsWith('bypass_')) {
      // En modo bypass, si hay error 401 en algunos endpoints,
      // simplemente rechaza el error pero mantiene la sesión
      console.warn('[F1 SYSTEM] ⚠️ Bypass mode active. Suppressed 401 logout trigger over', error.response?.status)
    } else if (error.response?.status === 401) {
      console.warn('[F1 SYSTEM] ⚠️ Unauthorized access derived. Terminating session...')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (username, password) => 
    api.post('/api/auth/login', new URLSearchParams({ username, password })),
  refresh: (refreshToken) => 
    api.post('/api/auth/refresh', { refresh_token: refreshToken }),
}

// Companies API
export const companiesAPI = {
  getAll: () => api.get('/api/companies'),
  getById: (id) => api.get(`/api/companies/${id}`),
  create: (data) => api.post('/api/companies', data),
  update: (id, data) => api.put(`/api/companies/${id}`, data),
  delete: (id) => api.delete(`/api/companies/${id}`),
}

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/api/categories'),
  getById: (id) => api.get(`/api/categories/${id}`),
  create: (data) => api.post('/api/categories', data),
  update: (id, data) => api.put(`/api/categories/${id}`, data),
  delete: (id) => api.delete(`/api/categories/${id}`),
}

// Employees API
export const employeesAPI = {
  getAll: (params) => api.get('/api/employees', { params }),
  getById: (id) => api.get(`/api/employees/${id}`),
  create: (data) => api.post('/api/employees', data),
  update: (id, data) => api.put(`/api/employees/${id}`, data),
  delete: (id) => api.delete(`/api/employees/${id}`),
  scan: (qrCode) => api.post('/api/employees/scan', { qr_code: qrCode }),
  getQR: (id) => api.get(`/api/employees/${id}/qr`, { responseType: 'blob' }),
}

// Menu Items API
export const menuItemsAPI = {
  getAll: (params) => api.get('/api/menu-items', { params }),
  getById: (id) => api.get(`/api/menu-items/${id}`),
  create: (data) => api.post('/api/menu-items', data),
  update: (id, data) => api.put(`/api/menu-items/${id}`, data),
  delete: (id) => api.delete(`/api/menu-items/${id}`),
}

// Consumptions API
export const consumptionsAPI = {
  getAll: (params) => api.get('/api/consumptions', { params }),
  create: (data) => api.post('/api/consumptions', data),
}

// Reports API
export const reportsAPI = {
  byCompany: (params) => api.get('/api/reports/by-company', { params }),
  byCategory: (params) => api.get('/api/reports/by-category', { params }),
  byEmployee: (params) => api.get('/api/reports/by-employee', { params }),
  dailySummary: (params) => api.get('/api/reports/daily-summary', { params }),
  dashboardStats: () => api.get('/api/reports/dashboard/stats'),
  exportExcel: (params) => api.get('/api/reports/export/excel', { 
    params,
    responseType: 'blob' 
  }),
}

export default api
