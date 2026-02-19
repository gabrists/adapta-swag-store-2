import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Save, Upload, X, Image as ImageIcon } from 'lucide-react'

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
  imageQuery: z.string().min(2, 'Informe um termo ou faça upload'),
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
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

        if (
          product.imageQuery.startsWith('data:') ||
          product.imageQuery.startsWith('http')
        ) {
          setImagePreview(product.imageQuery)
        } else {
          setImagePreview(
            `https://img.usecurling.com/p/100/100?q=${product.imageQuery}`,
          )
        }
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
        setImagePreview(null)
      }
    }
  }, [open, product, form])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit
        alert('A imagem deve ser menor que 2MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
        form.setValue('imageQuery', result, { shouldValidate: true })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    form.setValue('imageQuery', '')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const finalData = {
      name: values.name,
      category: values.category,
      description: values.description,
      imageQuery: values.imageQuery,
      hasGrid: values.hasGrid,
      stock: values.hasGrid ? 0 : values.stock,
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
    setImagePreview(null)
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

            <div className="space-y-4">
              <FormLabel>Imagem do Produto</FormLabel>

              <div className="flex flex-col gap-4">
                {imagePreview ? (
                  <div className="relative w-full h-40 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-500">
                      Clique para fazer upload
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      ou arraste e solte
                    </span>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <div className="h-px bg-slate-200 flex-1"></div>
                  <span className="text-xs text-slate-400 uppercase">
                    Ou use um termo
                  </span>
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                <FormField
                  control={form.control}
                  name="imageQuery"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Ex: black backpack"
                            className="pl-9 rounded-lg"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              if (
                                !e.target.value.startsWith('data:') &&
                                !e.target.value.startsWith('http')
                              ) {
                                setImagePreview(
                                  `https://img.usecurling.com/p/100/100?q=${e.target.value}`,
                                )
                              } else {
                                setImagePreview(e.target.value)
                              }
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
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
