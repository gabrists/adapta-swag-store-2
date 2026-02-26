import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Calendar, CheckCircle } from 'lucide-react'
import useSwagStore from '@/stores/useSwagStore'
import { Kit } from '@/types'

interface EventCheckoutDialogProps {
  kit: Kit | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventCheckoutDialog({
  kit,
  open,
  onOpenChange,
}: EventCheckoutDialogProps) {
  const { checkoutEventKit, products } = useSwagStore()

  const [eventName, setEventName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!kit || !eventName.trim() || quantity < 1 || !date) return
    setIsSubmitting(true)
    setError(null)
    try {
      await checkoutEventKit(kit.id, eventName, quantity, new Date(date))
      setEventName('')
      setQuantity(1)
      setDate(new Date().toISOString().split('T')[0])
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || 'Erro ao processar saída.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!kit) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Registrar Saída para Evento
          </DialogTitle>
          <DialogDescription>
            O estoque será debitado e classificado financeiramente como "Custo
            com Eventos Externos".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="p-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" /> {kit.name}
            </h4>
            <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
              {kit.items.map((ki) => {
                const product = products.find((p) => p.id === ki.itemId)
                return (
                  <li key={ki.id} className="flex justify-between">
                    <span>
                      {ki.quantity}x {product?.name}
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-300">
                      Total: {ki.quantity * quantity} unid.
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="space-y-2">
            <Label>Nome do Evento</Label>
            <Input
              placeholder="Ex: Adapta Scale SP"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantidade de Kits</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Data da Retirada</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-500/20">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!eventName.trim() || quantity < 1 || isSubmitting}
            className="btn-primary-glow"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Calendar className="w-4 h-4 mr-2" />
            )}
            Confirmar Saída
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
