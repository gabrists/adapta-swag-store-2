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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus, Trash2, Box } from 'lucide-react'
import useSwagStore from '@/stores/useSwagStore'
import { useToast } from '@/hooks/use-toast'

interface KitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KitDialog({ open, onOpenChange }: KitDialogProps) {
  const { products, createKit } = useSwagStore()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [items, setItems] = useState<{ itemId: string; quantity: number }[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddItem = () => {
    if (!selectedProduct || quantity < 1) return
    if (items.some((i) => i.itemId === selectedProduct)) {
      toast({
        title: 'Item já adicionado',
        description: 'Este item já faz parte do kit.',
        variant: 'destructive',
      })
      return
    }
    setItems([...items, { itemId: selectedProduct, quantity }])
    setSelectedProduct('')
    setQuantity(1)
  }

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter((i) => i.itemId !== itemId))
  }

  const handleSubmit = async () => {
    if (!name.trim() || items.length === 0) return

    setIsSubmitting(true)
    try {
      await createKit(name, items)
      toast({
        title: 'Kit criado com sucesso!',
        description: `O kit "${name}" já está disponível para uso.`,
        className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      })
      setName('')
      setItems([])
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: 'Erro ao criar kit',
        description: error.message || 'Tente novamente com outro nome.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Novo Kit</DialogTitle>
          <DialogDescription>
            Crie um pacote de produtos padronizado para facilitar as saídas em
            eventos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Nome do Kit</Label>
            <Input
              placeholder="Ex: Kit Adapta Scale 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-4 p-4 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-black/20">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Composição do Kit
            </h4>

            <div className="flex gap-2">
              <div className="flex-1">
                <Select
                  value={selectedProduct}
                  onValueChange={setSelectedProduct}
                >
                  <SelectTrigger className="w-full bg-white dark:bg-[#081a17]/90 border-slate-200 dark:border-white/10">
                    <SelectValue placeholder="Selecione um produto..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products
                      .filter((p) => p.isActive && !p.hasGrid)
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} (Estoque: {p.stock})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-24">
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="bg-white dark:bg-[#081a17]/90 border-slate-200 dark:border-white/10"
                />
              </div>
              <Button
                variant="outline"
                onClick={handleAddItem}
                disabled={!selectedProduct || quantity < 1}
                className="bg-white dark:bg-black/20"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {items.length > 0 && (
              <ul className="space-y-2 mt-4">
                {items.map((item) => {
                  const product = products.find((p) => p.id === item.itemId)
                  return (
                    <li
                      key={item.itemId}
                      className="flex items-center justify-between p-3 bg-white dark:bg-[#081a17]/90 rounded-lg border border-slate-200 dark:border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <Box className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm text-slate-800 dark:text-slate-200">
                          {item.quantity}x {product?.name}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                        onClick={() => handleRemoveItem(item.itemId)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
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
            disabled={!name.trim() || items.length === 0 || isSubmitting}
            className="btn-primary-glow"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Salvar Kit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
