import { Navigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6]">
        <Loader2 className="w-8 h-8 animate-spin text-[#488775]" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
