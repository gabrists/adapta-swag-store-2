import { useMemo } from 'react'
import useSwagStore from '@/stores/useSwagStore'
import useAuthStore from '@/stores/useAuthStore'
import {
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export default function OrdersPage() {
  const { orders, isLoading } = useSwagStore()
  const { user } = useAuthStore()

  // Filter orders for current user
  const myOrders = useMemo(() => {
    if (!user) return []
    return orders.filter((order) => order.employeeEmail === user.email)
  }, [orders, user])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-100 rounded animate-pulse" />
        <div className="h-24 w-full bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-24 w-full bg-slate-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Meus Pedidos
        </h1>
        <p className="text-sm text-slate-500">
          Acompanhe o status das suas solicitações de brindes.
        </p>
      </div>

      {myOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-dashed border-slate-200 rounded-xl">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">
            Nenhuma solicitação encontrada
          </h3>
          <p className="text-slate-500 text-sm mt-1 max-w-xs">
            Visite a vitrine para solicitar novos brindes e eles aparecerão
            aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {myOrders.map((order) => (
            <Card
              key={order.id}
              className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  {/* Status Indicator Bar */}
                  <div
                    className={cn(
                      'w-full sm:w-2 h-2 sm:h-auto sm:self-stretch',
                      order.status === 'Pendente' && 'bg-yellow-400',
                      order.status === 'Entregue' && 'bg-[#0E9C8B]',
                      order.status === 'Rejeitado' && 'bg-red-500',
                    )}
                  />

                  <div className="flex-1 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center">
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="h-16 w-16 rounded-lg border border-slate-100">
                        <AvatarImage
                          src={
                            order.productImage?.startsWith('http') ||
                            order.productImage?.startsWith('data:')
                              ? order.productImage
                              : `https://img.usecurling.com/p/100/100?q=${order.productImage}&dpr=2`
                          }
                          alt={order.productName}
                          className="object-cover"
                        />
                        <AvatarFallback className="rounded-lg">
                          {order.productName?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="space-y-1">
                        <h3 className="font-semibold text-slate-900 line-clamp-1">
                          {order.productName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <span className="font-medium">
                            Qtd: {order.quantity}
                          </span>
                          {order.size && (
                            <>
                              <span className="w-1 h-1 bg-slate-300 rounded-full" />
                              <Badge
                                variant="outline"
                                className="text-[10px] h-5 px-1.5 font-normal bg-slate-50"
                              >
                                {order.size}
                              </Badge>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Calendar className="w-3 h-3" />
                          {format(
                            parseISO(order.createdAt),
                            "d 'de' MMM, HH:mm",
                            {
                              locale: ptBR,
                            },
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 min-w-[140px]">
                      {order.status === 'Pendente' && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100 gap-1.5 py-1 px-3">
                          <Clock className="w-3.5 h-3.5" />
                          Pendente
                        </Badge>
                      )}
                      {order.status === 'Entregue' && (
                        <Badge className="bg-[#0E9C8B]/10 text-[#0E9C8B] border-[#0E9C8B]/20 hover:bg-[#0E9C8B]/20 gap-1.5 py-1 px-3">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Entregue
                        </Badge>
                      )}
                      {order.status === 'Rejeitado' && (
                        <div className="flex items-center gap-2">
                          {order.rejectionReason && (
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertCircle className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Motivo: {order.rejectionReason}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          <Badge
                            variant="destructive"
                            className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100 gap-1.5 py-1 px-3"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Rejeitado
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
