import { useState, useEffect, useRef } from 'react'
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { employeesAPI, consumptionsAPI } from '@/services/api'
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
              <p className="text-xs font-bold text-red-500 uppercase tracking-widest mt-1">Escáner de Check-in</p>
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

// Get current meal type based on time
function getCurrentMealType() {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 11) return 'BREAKFAST'
  if (hour >= 11 && hour < 16) return 'LUNCH'
  if (hour >= 16 && hour < 23) return 'DINNER'
  return 'LUNCH'
}

function getMealTypeName(type) {
  switch (type) {
    case 'BREAKFAST': return 'Desayuno'
    case 'LUNCH': return 'Comida'
    case 'DINNER': return 'Cena'
    default: return type
  }
}

export default function Scanner() {
  const [scanning, setScanning] = useState(false)
  const [scannedEmployee, setScannedEmployee] = useState(null)
  const [scanError, setScanError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [consumptionsToday, setConsumptionsToday] = useState(0)
  const [dailyLimit, setDailyLimit] = useState(3)
  const [duplicateWarning, setDuplicateWarning] = useState(false)
  const [lastScan, setLastScan] = useState(null)
  
  const scannerRef = useRef(null)
  const html5QrcodeScannerRef = useRef(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  const currentMealType = getCurrentMealType()

  useEffect(() => {
    return () => {
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear().catch(() => {})
      }
    }
  }, [])

  const startScanning = () => {
    setScanning(true)
    setScanError(null)
    
    setTimeout(() => {
      if (!scannerRef.current) return
      
      html5QrcodeScannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      )

      html5QrcodeScannerRef.current.render(
        (decodedText) => {
          handleScan(decodedText)
        },
        (error) => {
          // Ignore scan errors (they happen frequently when no QR is visible)
        }
      )
    }, 100)
  }

  const stopScanning = () => {
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.clear().catch(() => {})
    }
    setScanning(false)
  }

  const handleScan = async (qrCode) => {
    // Prevent duplicate scans within 2 seconds
    if (lastScan && qrCode === lastScan.qrCode && Date.now() - lastScan.time < 2000) {
      return
    }

    stopScanning()
    setLoading(true)
    setScanError(null)
    setDuplicateWarning(false)

    try {
      // Scan the QR code to get employee info
      const response = await employeesAPI.scan(qrCode)
      const employeeData = response.data
      
      setScannedEmployee(employeeData.employee)
      setConsumptionsToday(employeeData.consumptions_today || 0)
      setDailyLimit(employeeData.category?.daily_limit || 3)
      setLastScan({ qrCode, time: Date.now() })

      // Check for duplicate scan warning
      if (employeeData.is_duplicate) {
        setDuplicateWarning(true)
        toast.error('⚠️ Advertencia: Este empleado ya consumió recientemente')
      }

    } catch (error) {
      const message = error.response?.data?.detail || 'Error al escanear código QR'
      setScanError(message)
      toast.error(message)
      setTimeout(() => {
        setScanning(true)
        startScanning()
      }, 2000)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmConsumption = async () => {
    if (!scannedEmployee) return

    setLoading(true)
    try {
      await consumptionsAPI.create({
        employee_id: scannedEmployee.id,
        meal_type: currentMealType,
        items: [],
        notes: '',
      })

      toast.success(`✅ Consumo registrado para ${scannedEmployee.first_name} ${scannedEmployee.last_name}`)
      
      // Clear and restart scanning after 3 seconds
      setTimeout(() => {
        setScannedEmployee(null)
        setConsumptionsToday(0)
        setDuplicateWarning(false)
        startScanning()
      }, 3000)

    } catch (error) {
      const message = error.response?.data?.detail || 'Error al registrar consumo'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setScannedEmployee(null)
    setConsumptionsToday(0)
    setDuplicateWarning(false)
    startScanning()
  }

  const getStatusColor = () => {
    if (consumptionsToday >= dailyLimit) return 'red'
    if (consumptionsToday === 0) return 'yellow'
    if (duplicateWarning) return 'orange'
    return 'green'
  }

  const getStatusMessage = () => {
    if (consumptionsToday >= dailyLimit) return 'Límite alcanzado'
    if (consumptionsToday === 0) return 'Primer consumo del día'
    if (duplicateWarning) return 'Escaneo duplicado'
    return 'Consumo normal'
  }

  const progress = Math.min((consumptionsToday / dailyLimit) * 100, 100)

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border-l-4 border-red-600 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black italic uppercase text-slate-900 tracking-wide">Punto de Control</h2>
            <p className="text-gray-500 font-semibold uppercase tracking-wider text-sm mt-1">Turno en curso: <span className="font-bold text-red-600 px-2 py-0.5 bg-red-50 rounded">{getMealTypeName(currentMealType)}</span></p>
          </div>
          <div className="text-right bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-lg font-black text-slate-800 font-mono tracking-widest leading-none mt-1">{new Date().toLocaleTimeString('es-MX')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📷 Lector QR</h3>
            
            {!scanning && !scannedEmployee && !loading && !scanError && (
              <div className="text-center py-12">
                <div className="mb-6">
                  <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <button
                  onClick={startScanning}
                  className="bg-gradient-to-r from-slate-800 to-slate-900 hover:from-black hover:to-slate-800 text-white border border-slate-700 shadow-md shadow-slate-900/20 font-bold uppercase tracking-widest text-sm py-4 px-8 rounded-xl transition-all w-full flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Activar Escáner
                </button>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4 shadow-sm"></div>
                <p className="text-slate-600 font-bold uppercase tracking-widest text-sm animate-pulse">Procesando Identificación...</p>
              </div>
            )}

            {scanError && !scannedEmployee && (
              <div className="text-center py-8">
                <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-r mb-6 shadow-sm text-left">
                  <p className="font-bold uppercase tracking-wider text-sm flex items-center gap-2"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> Error de Lectura</p>
                  <p className="mt-1 text-sm font-medium">{scanError}</p>
                </div>
                <button
                  onClick={startScanning}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold uppercase tracking-widest text-sm py-3 px-8 rounded-xl shadow-md"
                >
                  Reintentar Escaneo
                </button>
              </div>
            )}

            {scanning && (
              <div>
                <div id="qr-reader" ref={scannerRef} className="w-full"></div>
                <button
                  onClick={stopScanning}
                  className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg"
                >
                  Detener Escáner
                </button>
              </div>
            )}
          </div>

          {/* Result Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Resultado del Escaneo</h3>
            
            {!scannedEmployee ? (
              <div className="text-center py-12 text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>Escanea un código QR para ver el resultado</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Employee Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-slate-900 border-2 border-slate-700 shadow-inner rounded-xl flex items-center justify-center">
                      <span className="text-2xl font-black italic text-red-500">
                        {scannedEmployee.first_name[0]}{scannedEmployee.last_name[0]}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
                        {scannedEmployee.first_name} {scannedEmployee.last_name}
                      </h4>
                      <p className="text-red-600 font-mono font-bold tracking-widest text-sm bg-red-50 inline-block px-2 py-0.5 rounded mt-1 border border-red-100">{scannedEmployee.employee_number}</p>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{scannedEmployee.company?.name || 'Empresa'}</p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className={`rounded-lg p-4 border-2 ${
                  getStatusColor() === 'red' ? 'bg-red-50 border-red-300' :
                  getStatusColor() === 'yellow' ? 'bg-yellow-50 border-yellow-300' :
                  getStatusColor() === 'orange' ? 'bg-orange-50 border-orange-300' :
                  'bg-green-50 border-green-300'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Estado:</span>
                    <span className={`font-bold ${
                      getStatusColor() === 'red' ? 'text-red-600' :
                      getStatusColor() === 'yellow' ? 'text-yellow-600' :
                      getStatusColor() === 'orange' ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {getStatusMessage()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Consumos hoy:</span>
                    <span className="font-bold">{consumptionsToday} de {dailyLimit}</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                    <div 
                      className={`h-4 rounded-full transition-all ${
                        getStatusColor() === 'red' ? 'bg-red-500' :
                        getStatusColor() === 'yellow' ? 'bg-yellow-500' :
                        getStatusColor() === 'orange' ? 'bg-orange-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Duplicate Warning */}
                {duplicateWarning && (
                  <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded">
                    <p className="font-bold">⚠️ Advertencia</p>
                    <p>Este empleado ya realizó un consumo hace menos de 5 minutos</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-4">
                  <button
                    onClick={handleConfirmConsumption}
                    disabled={loading || consumptionsToday >= dailyLimit}
                    className={`flex-1 font-black italic uppercase tracking-widest text-sm py-4 px-6 rounded-xl transition-all shadow-md ${
                      consumptionsToday >= dailyLimit
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none border border-slate-300'
                        : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white border border-emerald-700'
                    }`}
                  >
                    {loading ? 'Procesando...' : 'Autorizar'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="bg-white hover:bg-red-50 text-red-600 border border-red-200 font-black italic uppercase tracking-widest text-sm py-4 px-6 rounded-xl transition-all shadow-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
