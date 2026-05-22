import { useAuth } from '../../../hooks/useAuth'

export default function RoleGuard({ allowedRoles, children }) {
  const { user } = useAuth()
  if (!user || !allowedRoles.includes(user.role)) return null
  return children
}
