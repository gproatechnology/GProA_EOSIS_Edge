import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // BYPASS: Permitir acceso si el usuario tiene el rol correcto (incluso con token de bypass)
  // El token de bypass es solo para desarrollo - en producción se debe verificar con el backend
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to default route based on role
    switch (user.role) {
      case 'ADMIN':
        return <Navigate to="/dashboard" replace />
      case 'SUPERVISOR':
        return <Navigate to="/monitor" replace />
      case 'CASHIER':
        return <Navigate to="/scanner" replace />
      case 'EMPLOYEE':
        return <Navigate to="/mis-consumos" replace />
      default:
        return <Navigate to="/login" replace />
    }
  }

  return children
}
