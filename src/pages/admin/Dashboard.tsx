import { Link } from 'react-router-dom'
import { ArrowRight, Package, Users, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import useSwagStore from '@/stores/useSwagStore'

export default function Dashboard() {
  const { products, history } = useSwagStore()

  const lowStockCount = products.filter((p) => p.stock < 5).length
  const totalItems = products.reduce((acc, curr) => acc + curr.stock, 0)
  const totalHistory = history.length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="text-slate-500 mt-2">Visão geral da Adapta Swag Store.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total em Estoque
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Itens disponíveis para retirada
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas Totais</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHistory}</div>
            <p className="text-xs text-muted-foreground">
              Brindes distribuídos desde o início
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Itens com menos de 5 unidades
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 p-8 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/50">
        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
          <Package className="w-6 h-6" />
        </div>
        <div className="max-w-md">
          <h3 className="text-lg font-semibold text-slate-900">
            Gerenciar Inventário
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            Acesse a área completa de gestão para adicionar novos produtos,
            editar existentes e controlar o estoque.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/inventory">
            Ir para Inventário <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

function AlertTriangleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}
