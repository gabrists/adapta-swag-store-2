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
  Vestuário: 'bg-pink-100 text-pink-800 border-pink-200',
  Utensílios: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Kits: 'bg-indigo-100 text-indigo-800 border-indigo-200',
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

  const handleAdjustStock = (id: string, amount: number, size?: string) => {
    adjustStock(id, amount, size)
    toast({
      title: 'Estoque atualizado',
      description: `Quantidade de ${size ? size : 'item'} ajustada em ${amount > 0 ? '+' : ''}${amount}.`,
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
          className="bg-primary hover:bg-primary/90 text-white shadow-sm rounded-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Item
        </Button>
      </div>

      <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm max-w-sm">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <Input
          placeholder="Buscar item..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-none shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="w-[300px]">Item</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="min-w-[200px]">Estoque</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
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
                            product.imageQuery.startsWith('http') ||
                            product.imageQuery.startsWith('data:')
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
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">
                          {product.name}
                        </span>
                        {product.stock < 3 && (
                          <div className="flex items-center text-xs text-red-500 font-medium animate-pulse">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Estoque
                            Baixo
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'font-medium rounded-md',
                        categoryColors[product.category] ||
                          categoryColors['Institucional'],
                      )}
                    >
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {product.hasGrid && product.grid ? (
                      <div className="flex gap-4">
                        {['P', 'M', 'G', 'GG'].map((size) => (
                          <div
                            key={size}
                            className="flex flex-col items-center gap-1"
                          >
                            <span
                              className={cn(
                                'text-xs font-bold',
                                product.grid![size] === 0
                                  ? 'text-red-500'
                                  : 'text-slate-500',
                              )}
                            >
                              {size}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px]"
                                onClick={() =>
                                  handleAdjustStock(product.id, -1, size)
                                }
                                disabled={product.grid![size] <= 0}
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                              <span
                                className={cn(
                                  'text-sm font-semibold w-5 text-center',
                                  product.grid![size] < 3
                                    ? 'text-red-600'
                                    : 'text-slate-700',
                                )}
                              >
                                {product.grid![size]}
                              </span>
                              <button
                                className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px]"
                                onClick={() =>
                                  handleAdjustStock(product.id, 1, size)
                                }
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-md"
                          onClick={() => handleAdjustStock(product.id, -1)}
                          disabled={product.stock <= 0}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                        <span
                          className={cn(
                            'text-lg font-semibold w-8 text-center',
                            product.stock < 3
                              ? 'text-red-600'
                              : 'text-slate-700',
                          )}
                        >
                          {product.stock}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-md"
                          onClick={() => handleAdjustStock(product.id, 1)}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-md"
                        >
                          <span className="sr-only">Menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-lg">
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
        <AlertDialogContent className="rounded-xl">
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
            <AlertDialogCancel className="rounded-lg">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
