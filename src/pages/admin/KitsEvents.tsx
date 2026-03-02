import { useState, useMemo } from 'react'
import { Plus, Search, Layers, Box, Trash2, ArrowRight } from 'lucide-react'
import useSwagStore from '@/stores/useSwagStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Kit } from '@/types'
import { KitDialog } from '@/components/admin/KitDialog'
import { EventCheckoutDialog } from '@/components/admin/EventCheckoutDialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function KitsEvents() {
  const { kits, products, deleteKit } = useSwagStore()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [isKitDialogOpen, setIsKitDialogOpen] = useState(false)
  const [checkoutKit, setCheckoutKit] = useState<Kit | null>(null)
  const [deleteKitData, setDeleteKitData] = useState<Kit | null>(null)

  const filteredKits = useMemo(() => {
    return kits.filter((k) =>
      k.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [kits, searchQuery])

  const calculateMaxKits = (kit: Kit) => {
    if (!kit.items || kit.items.length === 0) return 0
    let max = Infinity
    kit.items.forEach((ki) => {
      const product = products.find((p) => p.id === ki.itemId)
      const currentStock = product ? product.stock : 0
      const possible = Math.floor(currentStock / ki.quantity)
      if (possible < max) max = possible
    })
    return max === Infinity ? 0 : max
  }

  const confirmDelete = async () => {
    if (deleteKitData) {
      try {
        await deleteKit(deleteKitData.id)
        toast({
          title: 'Kit excluído',
          description: 'O kit foi removido com sucesso.',
        })
      } catch (error) {
        toast({
          title: 'Erro ao excluir',
          description: 'Não foi possível excluir o kit.',
          variant: 'destructive',
        })
      }
      setDeleteKitData(null)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Kits & Eventos
          </h1>
          <p className="text-base text-gray-500 dark:text-[#ADADAD]">
            Gerencie kits padronizados e realize saídas em lote para eventos.
          </p>
        </div>
        <Button
          onClick={() => setIsKitDialogOpen(true)}
          className="btn-primary-glow h-12 px-6 text-base rounded-xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Kit
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 glass-panel p-4 md:p-5 rounded-2xl">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-[#ADADAD]" />
          <Input
            placeholder="Buscar kit por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12"
          />
        </div>
      </div>

      {filteredKits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center glass-panel rounded-2xl border-dashed">
          <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <Layers className="w-10 h-10 text-slate-400 dark:text-[#ADADAD]" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            Nenhum kit encontrado
          </h3>
          <p className="text-gray-500 dark:text-[#ADADAD] text-sm mt-2 max-w-md mx-auto">
            Crie seu primeiro kit agrupando itens para facilitar as saídas para
            eventos como o Adapta Scale.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredKits.map((kit) => {
            const maxKits = calculateMaxKits(kit)
            const isCritical = maxKits === 0

            return (
              <Card
                key={kit.id}
                className="flex flex-col overflow-hidden hover:border-primary/30 transition-colors"
              >
                <CardHeader className="pb-4 bg-slate-50/50 dark:bg-black/20 border-b border-gray-100 dark:border-white/5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Box className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-lg truncate">
                        {kit.name}
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 -mr-2 -mt-2 shrink-0"
                      onClick={() => setDeleteKitData(kit)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 pt-4 pb-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate">
                        Estoque Máximo Possível:
                      </span>
                      <Badge
                        variant={isCritical ? 'destructive' : 'default'}
                        className={cn(
                          'text-sm px-3 py-0.5 shrink-0 whitespace-nowrap',
                          !isCritical &&
                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-transparent',
                        )}
                      >
                        {maxKits} {maxKits === 1 ? 'kit' : 'kits'}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Itens do Kit
                      </span>
                      <ul className="space-y-2">
                        {kit.items.map((ki) => {
                          const product = products.find(
                            (p) => p.id === ki.itemId,
                          )
                          return (
                            <li
                              key={ki.id}
                              className="flex justify-between items-center text-sm gap-4"
                            >
                              <span className="text-slate-800 dark:text-slate-200 truncate">
                                {ki.quantity}x{' '}
                                {product?.name || 'Item Removido'}
                              </span>
                              <span
                                className={cn(
                                  'text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shrink-0 whitespace-nowrap',
                                  (product?.stock || 0) < ki.quantity &&
                                    'text-red-500 border-red-200 dark:border-red-500/30',
                                )}
                              >
                                {product?.stock || 0} unid
                              </span>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t border-gray-100 dark:border-white/5">
                  <Button
                    className="w-full gap-2 font-medium"
                    onClick={() => setCheckoutKit(kit)}
                    disabled={isCritical}
                    variant={isCritical ? 'secondary' : 'default'}
                  >
                    {isCritical ? (
                      'Estoque Insuficiente'
                    ) : (
                      <>
                        Registrar Saída <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      <KitDialog open={isKitDialogOpen} onOpenChange={setIsKitDialogOpen} />

      <EventCheckoutDialog
        kit={checkoutKit}
        open={!!checkoutKit}
        onOpenChange={(open) => !open && setCheckoutKit(null)}
      />

      <AlertDialog
        open={!!deleteKitData}
        onOpenChange={(open) => !open && setDeleteKitData(null)}
      >
        <AlertDialogContent className="rounded-2xl glass-panel">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Kit</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o kit "{deleteKitData?.name}"? Esta
              ação não afetará o estoque dos itens, apenas removerá o
              agrupamento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
