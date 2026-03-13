import { useState, useRef, useCallback, useEffect } from 'react'
import { employeesAPI, consumptionsAPI } from '@/services/api'
import { playSound } from '@/utils/sounds'

export function useAccessControl() {
  const [isScanning, setIsScanning] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Real-time telemetry stats
  const [stats, setStats] = useState({
    total: 0,
    granted: 0,
    denied: 0,
    duplicates: 0
  })

  // History log (last 30)
  const [history, setHistory] = useState([])
  
  // Current active scan result showing on screen
  const [currentResult, setCurrentResult] = useState(null) // { status, employee, message, timestamp }
  
  // System status
  const [systemStatus, setSystemStatus] = useState({
    camera: 'OFFLINE', // ONLINE, OFFLINE, ERROR
    scanner: 'IDLE',   // SCANNING, IDLE
    fps: 0,
    dbConnection: 'CONNECTED',
    latency: 0
  })

  // Ref to track last scanned code to avoid debouncing loops from the camera
  const lastScanRef = useRef({ code: null, time: 0 })

  const addHistory = (record) => {
    setHistory(prev => [record, ...prev].slice(0, 30))
  }

  const handleScan = useCallback(async (qrCode) => {
    const now = Date.now()
    
    // Prevent double scanning the exact same code within 3 seconds
    if (lastScanRef.current.code === qrCode && now - lastScanRef.current.time < 3000) {
      return
    }
    
    // Valid new scan detected
    lastScanRef.current = { code: qrCode, time: now }
    playSound('scan')
    
    const startTime = performance.now()
    
    try {
      // 1 & 2. Fetch employee details
      const response = await employeesAPI.scan(qrCode)
      const data = response.data
      const employee = data.employee
      
      const latency = Math.round(performance.now() - startTime)
      setSystemStatus(prev => ({ ...prev, latency }))

      if (!employee) {
        throw new Error('Employee not found')
      }

      // Check duplications or limits
      if (data.is_duplicate) {
        playSound('duplicate')
        const result = {
          status: 'ALREADY_REGISTERED',
          employee,
          message: 'Empleado ya consumió recientemente.',
          timestamp: new Date()
        }
        setCurrentResult(result)
        addHistory(result)
        setStats(s => ({ ...s, total: s.total + 1, duplicates: s.duplicates + 1 }))
        return
      }

      const consumptionsToday = data.consumptions_today || 0
      const dailyLimit = employee.category?.daily_limit || 3

      if (consumptionsToday >= dailyLimit) {
        playSound('error')
        const result = {
          status: 'ACCESS_DENIED',
          employee,
          message: 'Límite diario de consumos alcanzado.',
          timestamp: new Date()
        }
        setCurrentResult(result)
        addHistory(result)
        setStats(s => ({ ...s, total: s.total + 1, denied: s.denied + 1 }))
        return
      }

      // 6. Automatically register access
      await consumptionsAPI.create({
        employee_id: employee.id,
        meal_type: getCurrentMealType(),
        items: [],
        notes: 'Auto Check-in F1 System'
      })

      playSound('success')
      const result = {
        status: 'ACCESS_GRANTED',
        employee,
        message: 'Acceso Autorizado',
        timestamp: new Date()
      }
      setCurrentResult(result)
      addHistory(result)
      setStats(s => ({ ...s, total: s.total + 1, granted: s.granted + 1 }))

    } catch (error) {
      playSound('error')
      const latency = Math.round(performance.now() - startTime)
      setSystemStatus(prev => ({ ...prev, latency }))
      
      const result = {
        status: 'EMPLOYEE_NOT_FOUND',
        employee: { first_name: 'Desconocido', last_name: '', employee_number: qrCode },
        message: 'Código QR inválido o no encontrado',
        timestamp: new Date()
      }
      setCurrentResult(result)
      addHistory(result)
      setStats(s => ({ ...s, total: s.total + 1, denied: s.denied + 1 }))
    }
    
    // Auto-clear result panel after 4 seconds
    setTimeout(() => {
      setCurrentResult(prev => {
        // Only clear if no new scan happened in these 4 seconds
        if (prev?.timestamp.getTime() === now) {
          return null
        }
        return prev
      })
    }, 4000)
    
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`)
      })
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }
  
  // Listen for fullscreen changes made by Esc key
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return {
    isScanning,
    setIsScanning,
    isFullscreen,
    toggleFullscreen,
    stats,
    history,
    currentResult,
    systemStatus,
    setSystemStatus,
    handleScan
  }
}

// Helper 
function getCurrentMealType() {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 11) return 'BREAKFAST'
  if (hour >= 11 && hour < 16) return 'LUNCH'
  if (hour >= 16 && hour < 23) return 'DINNER'
  return 'LUNCH'
}
