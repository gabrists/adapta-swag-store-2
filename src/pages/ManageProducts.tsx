import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Save, Image as ImageIcon } from 'lucide-react'
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

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  stock: z.coerce.number().min(0, 'Quantidade não pode ser negativa'),
  description: z
    .string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  category: z.enum(['Vendas', 'RH', 'Marketing', 'Tech', 'Institucional'], {
    required_error: 'Selecione uma categoria',
  }),
  imageQuery: z.string().min(3, 'Informe uma URL ou termo para imagem'),
})

export default function ManageProducts() {
  const { addProduct } = useSwagStore()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      stock: 0,
      description: '',
      imageQuery: '',
    },
  })

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

              <FormField
                control={form.control}
                name="imageQuery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Imagem ou Termo (Placeholder)</FormLabel>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        className="pl-9"
                        placeholder="Ex: 'black backpack' ou https://..."
                        {...field}
                      />
                    </div>
                    <FormDescription>
                      Digite um termo em inglês (para gerar imagem automática)
                      ou cole uma URL direta.
                    </FormDescription>
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
