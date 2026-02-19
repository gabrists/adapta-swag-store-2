import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  MoreHorizontal,
  AlertTriangle,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import useSwagStore from '@/stores/useSwagStore'
import { Product } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { ProductDialog } from '@/components/admin/ProductDialog'

const categoryColors: Record<string, string> = {
  Vendas: 'bg-blue-100 text-blue-800 border-blue-200',
  RH: 'bg-green-100 text-green-800 border-green-200',
  Marketing: 'bg-orange-100 text-orange-800 border-orange-200',
  Tech: 'bg-purple-100 text-purple-800 border-purple-200',
  Institucional: 'bg-slate-100 text-slate-800 border-slate-200',
}

export default function Inventory() {
  const { products, addProduct, updateProduct, deleteProduct, adjustStock } =
    useSwagStore()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [deleteProductData, setDeleteProductData] = useState<Product | null>(
    null,
  )

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [products, searchQuery])

  const handleCreate = () => {
    setSelectedProduct(null)
    setDialogOpen(true)
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setDialogOpen(true)
  }

  const handleDelete = (product: Product) => {
    setDeleteProductData(product)
  }

  const confirmDelete = () => {
    if (deleteProductData) {
      deleteProduct(deleteProductData.id)
      setDeleteProductData(null)
      toast({
        title: 'Item excluído',
        description: `${deleteProductData.name} foi removido do inventário.`,
        variant: 'destructive',
      })
    }
  }

  const handleSaveProduct = async (values: any) => {
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (selectedProduct) {
      updateProduct({
        ...selectedProduct,
        ...values,
      })
      toast({
        title: 'Item salvo com sucesso!',
        description: 'As alterações foram atualizadas.',
        className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      })
    } else {
      addProduct(values)
      toast({
        title: 'Item criado!',
        description: 'Novo item adicionado ao inventário.',
        className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      })
    }
  }

  const handleAdjustStock = (id: string, amount: number) => {
    adjustStock(id, amount)
    toast({
      title: 'Estoque atualizado',
      description: `Quantidade ajustada em ${amount > 0 ? '+' : ''}${amount}.`,
      duration: 1500,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Gestão de Inventário
          </h1>
          <p className="text-sm text-slate-500">
            Gerencie todos os brindes e estoque da loja.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-primary hover:bg-primary/90 text-white shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Item
        </Button>
      </div>

      <div className="flex items-center space-x-2 bg-white p-1 rounded-md border border-slate-200 shadow-sm max-w-sm">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <Input
          placeholder="Buscar item..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-none shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="w-[300px]">Item</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Ajuste Rápido</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-slate-500"
                >
                  Nenhum item encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-slate-200">
                        <AvatarImage
                          src={
                            product.imageQuery.startsWith('http')
                              ? product.imageQuery
                              : `https://img.usecurling.com/p/100/100?q=${product.imageQuery}`
                          }
                          alt={product.name}
                          className="object-cover"
                        />
                        <AvatarFallback>
                          {product.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-bold text-slate-800">
                        {product.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'font-medium',
                        categoryColors[product.category] ||
                          categoryColors['Institucional'],
                      )}
                    >
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-lg font-semibold',
                          product.stock < 5 ? 'text-red-600' : 'text-slate-700',
                        )}
                      >
                        {product.stock}
                      </span>
                      {product.stock < 5 && (
                        <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleAdjustStock(product.id, -1)}
                        disabled={product.stock <= 0}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleAdjustStock(product.id, 1)}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(product)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(product)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir Item
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={selectedProduct}
        onSave={handleSaveProduct}
      />

      <AlertDialog
        open={!!deleteProductData}
        onOpenChange={(open) => !open && setDeleteProductData(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o
              item
              <span className="font-bold text-slate-900">
                {' '}
                {deleteProductData?.name}{' '}
              </span>
              do inventário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
