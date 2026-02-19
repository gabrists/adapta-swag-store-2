import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Save, Image as ImageIcon, Upload, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import useSwagStore from '@/stores/useSwagStore'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  stock: z.coerce.number().min(0, 'Quantidade não pode ser negativa'),
  description: z
    .string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  category: z.string().min(1, 'Selecione uma categoria'),
  imageQuery: z
    .string()
    .min(3, 'Informe uma URL, termo ou faça upload de imagem'),
})

export default function ManageProducts() {
  const { addProduct } = useSwagStore()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      stock: 0,
      description: '',
      category: '',
      imageQuery: '',
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    processFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    processFile(file)
  }

  const processFile = (file?: File) => {
    if (file) {
      // 5MB Limit
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'A imagem deve ter no máximo 5MB.',
          variant: 'destructive',
        })
        return
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Formato inválido',
          description: 'Por favor, envie apenas arquivos de imagem.',
          variant: 'destructive',
        })
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
    setIsSubmitting(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600))

    addProduct({
      name: values.name,
      stock: values.stock,
      description: values.description,
      category: values.category,
      imageQuery: values.imageQuery,
    })

    toast({
      title: 'Brinde cadastrado!',
      description: `${values.name} foi adicionado ao catálogo com sucesso.`,
      className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    })

    setIsSubmitting(false)
    form.reset()
    setImagePreview(null)
    navigate('/')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Gerenciar Brindes
        </h1>
        <p className="text-sm text-slate-500">
          Cadastre novos itens no catálogo da loja.
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Novo Brinde</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para disponibilizar um novo item na
            vitrine.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Brinde</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Mochila Executiva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
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
              </div>

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade em Estoque</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="0" {...field} />
                    </FormControl>
                    <FormDescription>
                      Número inicial de itens disponíveis para retirada.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Imagem do Produto</FormLabel>

                <div className="flex flex-col gap-4">
                  {imagePreview ? (
                    <div className="relative w-full h-64 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 group">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={cn(
                        'w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200',
                        isDragging
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-300 hover:bg-slate-50 hover:border-slate-400',
                      )}
                    >
                      <div className="bg-slate-100 p-3 rounded-full mb-3">
                        <Upload
                          className={cn(
                            'w-6 h-6',
                            isDragging ? 'text-primary' : 'text-slate-400',
                          )}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        Clique para fazer upload
                      </span>
                      <span className="text-xs text-slate-500 mt-1">
                        ou arraste e solte (PNG, JPG, WEBP)
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
                    <span className="text-xs text-slate-400 uppercase font-medium">
                      Ou use URL / Termo
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
                              placeholder="Ex: 'black backpack' ou cole uma URL"
                              className="pl-9"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                if (e.target.value.startsWith('http')) {
                                  setImagePreview(e.target.value)
                                } else if (
                                  imagePreview &&
                                  imagePreview.startsWith('data:')
                                ) {
                                  // If input changes and we have a data URI upload, do nothing or clear?
                                  // We let the user type, but if they type, it will replace the data URI on submit
                                  // We don't clear the preview here to avoid flickering if they are just copying
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
                        placeholder="Descreva os detalhes do item..."
                        className="resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  className="min-w-[150px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Brinde
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
