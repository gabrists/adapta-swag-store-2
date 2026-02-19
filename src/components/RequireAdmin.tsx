import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function RequireAdmin() {
  const { user, isLoading } = useAuthStore()
  const location = useLocation()
  const { toast } = useToast()

  useEffect(() => {
    if (!isLoading && user && user.role !== 'admin') {
      toast({
        title: 'Acesso Negado',
        description: 'Você não tem permissão para acessar esta área.',
        variant: 'destructive',
      })
    }
  }, [user, isLoading, toast])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="mt-4 text-slate-500 font-medium animate-pulse">
          Verificando permissões...
        </p>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
