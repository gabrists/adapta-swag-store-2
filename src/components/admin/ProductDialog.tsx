import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Save } from 'lucide-react'

import { Product } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  category: z.string().min(1, 'Selecione uma categoria'),
  description: z.string().min(5, 'Descrição é obrigatória'),
  imageQuery: z.string().min(2, 'Informe um termo para imagem'),
  hasGrid: z.boolean(),
  stock: z.coerce.number().min(0).optional(),
  gridPP: z.coerce.number().min(0).optional(),
  gridP: z.coerce.number().min(0).optional(),
  gridM: z.coerce.number().min(0).optional(),
  gridG: z.coerce.number().min(0).optional(),
  gridGG: z.coerce.number().min(0).optional(),
})

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  onSave: (values: any) => Promise<void>
}

export function ProductDialog({
  open,
  onOpenChange,
  product,
  onSave,
}: ProductDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: 'Institucional',
      description: '',
      imageQuery: '',
      hasGrid: false,
      stock: 0,
      gridPP: 0,
      gridP: 0,
      gridM: 0,
      gridG: 0,
      gridGG: 0,
    },
  })

  const hasGrid = form.watch('hasGrid')

  useEffect(() => {
    if (open) {
      if (product) {
        form.reset({
          name: product.name,
          category: product.category,
          description: product.description || '',
          imageQuery: product.imageQuery,
          hasGrid: product.hasGrid,
          stock: product.stock,
          gridPP: product.grid?.PP || 0,
          gridP: product.grid?.P || 0,
          gridM: product.grid?.M || 0,
          gridG: product.grid?.G || 0,
          gridGG: product.grid?.GG || 0,
        })
      } else {
        form.reset({
          name: '',
          category: 'Institucional',
          description: '',
          imageQuery: '',
          hasGrid: false,
          stock: 0,
          gridPP: 0,
          gridP: 0,
          gridM: 0,
          gridG: 0,
          gridGG: 0,
        })
      }
    }
  }, [open, product, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const finalData = {
      name: values.name,
      category: values.category,
      description: values.description,
      imageQuery: values.imageQuery,
      hasGrid: values.hasGrid,
      stock: values.hasGrid ? 0 : values.stock, // Stock will be calculated in store for grid
      grid: values.hasGrid
        ? {
            PP: values.gridPP || 0,
            P: values.gridP || 0,
            M: values.gridM || 0,
            G: values.gridG || 0,
            GG: values.gridGG || 0,
          }
        : undefined,
    }

    await onSave(finalData)
    form.reset()
    onOpenChange(false)
  }

  const isEditing = !!product

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Item' : 'Novo Item'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Faça alterações nos detalhes do item abaixo.'
              : 'Preencha as informações para adicionar um novo item.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Mochila Executiva"
                      className="rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-lg">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="RH">RH</SelectItem>
                        <SelectItem value="Vendas">Vendas</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Tech">Tech</SelectItem>
                        <SelectItem value="Institucional">
                          Institucional
                        </SelectItem>
                        <SelectItem value="Vestuário">Vestuário</SelectItem>
                        <SelectItem value="Utensílios">Utensílios</SelectItem>
                        <SelectItem value="Kits">Kits</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasGrid"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Tem tamanhos?</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {hasGrid ? (
              <div className="space-y-2 border rounded-lg p-3 bg-slate-50">
                <FormLabel>Grade de Estoque</FormLabel>
                <div className="grid grid-cols-5 gap-2">
                  <FormField
                    control={form.control}
                    name="gridPP"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-center block">
                          PP
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            className="text-center px-1 rounded-md"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gridP"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-center block">
                          P
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            className="text-center px-1 rounded-md"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gridM"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-center block">
                          M
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            className="text-center px-1 rounded-md"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gridG"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-center block">
                          G
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            className="text-center px-1 rounded-md"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gridGG"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-center block">
                          GG
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            className="text-center px-1 rounded-md"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ) : (
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Inicial</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        className="rounded-lg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="imageQuery"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Termo da Imagem (Inglês)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: black backpack"
                      className="rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalhes sobre o produto..."
                      className="resize-none rounded-lg"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-lg"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="rounded-lg"
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isEditing ? 'Salvar Alterações' : 'Criar Item'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
