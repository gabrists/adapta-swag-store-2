import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Collaborator, Order } from '@/types'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { History, Package, Plus } from 'lucide-react'
import useSwagStore from '@/stores/useSwagStore'
import { ManualDeliveryDialog } from '@/components/admin/ManualDeliveryDialog'

interface CollaboratorProfileProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collaborator: Collaborator | null
}

export function CollaboratorProfile({
  open,
  onOpenChange,
  collaborator,
}: CollaboratorProfileProps) {
  const { orders } = useSwagStore()
  const [showManualDelivery, setShowManualDelivery] = useState(false)

  if (!collaborator) return null

  const employeeOrders = orders.filter(
    (o) => o.employeeId === collaborator.id && o.status === 'Entregue',
  )

  const totalItems = employeeOrders.reduce((acc, o) => acc + o.quantity, 0)

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-md flex flex-col h-full p-0 gap-0">
          <SheetHeader className="p-6 bg-slate-50 border-b border-slate-100">
            <SheetTitle className="sr-only">Perfil do Colaborador</SheetTitle>
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 border-4 border-white shadow-md mb-4">
                <AvatarImage
                  src={collaborator.avatarUrl}
                  alt={collaborator.name}
                />
                <AvatarFallback className="text-2xl font-bold text-primary bg-primary/10">
                  {collaborator.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold text-slate-900">
                {collaborator.name}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                <span>{collaborator.role}</span>
                <span>•</span>
                <span>{collaborator.department}</span>
              </div>
              <div className="mt-4 flex gap-4">
                <div className="flex flex-col items-center bg-white p-2 rounded-lg border border-slate-100 min-w-[100px] shadow-sm">
                  <span className="text-xs text-slate-500 uppercase font-semibold">
                    Total Itens
                  </span>
                  <span className="text-2xl font-bold text-[#0E9C8B]">
                    {totalItems}
                  </span>
                </div>
              </div>
            </div>
            <SheetDescription className="text-center mt-2 text-xs">
              Membro desde {format(new Date(), 'MMMM yyyy', { locale: ptBR })}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                Histórico de Brindes
              </h3>
              <Badge variant="outline" className="text-xs">
                {employeeOrders.length} entregas
              </Badge>
            </div>

            <ScrollArea className="flex-1 p-4 bg-slate-50/50">
              {employeeOrders.length > 0 ? (
                <div className="space-y-4">
                  <div className="absolute left-8 top-4 bottom-4 w-px bg-slate-200" />
                  {employeeOrders.map((order, idx) => (
                    <div key={order.id} className="relative pl-10">
                      <div className="absolute left-0 top-1.5 w-8 flex justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#0E9C8B] ring-4 ring-white" />
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex gap-3">
                        <Avatar className="h-10 w-10 border border-slate-100 rounded-md">
                          <AvatarImage
                            src={
                              order.productImage?.startsWith('http') ||
                              order.productImage?.startsWith('data:')
                                ? order.productImage
                                : `https://img.usecurling.com/p/100/100?q=${order.productImage}&dpr=2`
                            }
                            className="object-cover"
                          />
                          <AvatarFallback className="rounded-md">
                            Item
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {order.productName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">
                              {format(
                                parseISO(order.createdAt),
                                "d 'de' MMM, yyyy",
                                {
                                  locale: ptBR,
                                },
                              )}
                            </span>
                            {order.size && (
                              <Badge
                                variant="secondary"
                                className="h-4 px-1 text-[10px]"
                              >
                                {order.size}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                            x{order.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Package className="w-12 h-12 text-slate-200 mb-2" />
                  <p className="text-slate-500 text-sm">
                    Nenhum item recebido ainda.
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>

          <SheetFooter className="p-4 border-t border-slate-100 bg-white">
            <Button
              className="w-full bg-[#0E9C8B] hover:bg-[#0E9C8B]/90 text-white gap-2"
              onClick={() => setShowManualDelivery(true)}
            >
              <Plus className="w-4 h-4" />
              Registrar Entrega Manual
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ManualDeliveryDialog
        open={showManualDelivery}
        onOpenChange={setShowManualDelivery}
        employeeId={collaborator.id}
        onSuccess={() => {}}
      />
    </>
  )
}
