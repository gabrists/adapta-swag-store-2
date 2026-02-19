import { HistoryEntry } from '@/types'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Calendar, MapPin, User, Package, Ruler } from 'lucide-react'
import useSwagStore from '@/stores/useSwagStore'

interface HistoryItemProps {
  entry: HistoryEntry
}

export function HistoryItem({ entry }: HistoryItemProps) {
  const { team } = useSwagStore()

  const isQuery = !entry.productImageQuery.startsWith('http')
  const thumbnail = isQuery
    ? `https://img.usecurling.com/p/100/100?q=${entry.productImageQuery}&dpr=2`
    : entry.productImageQuery
  const largeImage = isQuery
    ? `https://img.usecurling.com/p/400/400?q=${entry.productImageQuery}&dpr=2`
    : entry.productImageQuery

  const date = parseISO(entry.date)
  const collaborator = team.find((c) => c.name === entry.user)
  const userAvatarUrl =
    collaborator?.avatarUrl ||
    `https://img.usecurling.com/ppl/thumbnail?gender=male&seed=${encodeURIComponent(entry.user)}`

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group flex items-center p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md hover:border-[#0E9C8B]/30 transition-all cursor-pointer relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0E9C8B] opacity-0 group-hover:opacity-100 transition-opacity" />

          <Avatar className="h-12 w-12 border border-slate-200 mr-4 shrink-0">
            <AvatarImage
              src={thumbnail}
              alt={entry.productName}
              className="object-cover"
            />
            <AvatarFallback>
              {entry.productName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-slate-900 truncate group-hover:text-[#0E9C8B] transition-colors">
                {entry.productName}
              </h4>
              {entry.size && (
                <Badge
                  variant="outline"
                  className="text-[10px] h-5 px-1.5 border-slate-200 text-slate-500 bg-slate-50"
                >
                  {entry.size}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <User className="w-3.5 h-3.5" />
              <span className="truncate max-w-[150px]">{entry.user}</span>
            </div>
          </div>

          <div className="text-right pl-2 flex flex-col items-end gap-1">
            <Badge
              variant="secondary"
              className="font-mono text-xs bg-slate-100 text-slate-700 group-hover:bg-[#0E9C8B]/10 group-hover:text-[#0E9C8B] transition-colors"
            >
              {entry.quantity} {entry.quantity === 1 ? 'item' : 'itens'}
            </Badge>
            <span className="text-xs text-slate-400 whitespace-nowrap">
              {format(date, 'd MMM, HH:mm', { locale: ptBR })}
            </span>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Detalhes da Movimentação</DialogTitle>
          <DialogDescription>
            Detalhes completos da retirada de {entry.productName}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-[#0E9C8B] p-6 text-white flex flex-col items-center justify-center relative">
          <div className="bg-white/20 absolute inset-0 backdrop-blur-[2px]" />
          <div className="relative z-10 flex flex-col items-center w-full">
            <div className="w-24 h-24 rounded-full border-4 border-white/30 bg-white shadow-xl mb-4 overflow-hidden">
              <img
                src={largeImage}
                alt={entry.productName}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-bold text-center leading-tight">
              {entry.productName}
            </h2>
            {entry.size && (
              <span className="mt-2 inline-flex items-center rounded-full bg-white/20 px-3 py-0.5 text-sm font-medium text-white border border-white/30 backdrop-blur-sm">
                <Ruler className="w-3 h-3 mr-1.5" />
                Tamanho: {entry.size}
              </span>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6 bg-white">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Package className="w-3 h-3" /> Quantidade
              </span>
              <span className="text-3xl font-bold text-[#0E9C8B]">
                {entry.quantity}
              </span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Data
              </span>
              <div className="flex flex-col items-center">
                <span className="text-base font-semibold text-slate-700">
                  {format(date, "d 'de' MMM", { locale: ptBR })}
                </span>
                <span className="text-xs text-slate-400">
                  {format(date, 'HH:mm', { locale: ptBR })}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-900 border-b border-slate-100 pb-2">
              Informações da Entrega
            </h3>

            <div className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mr-3 shrink-0 overflow-hidden">
                <img
                  src={userAvatarUrl}
                  alt={entry.user}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="text-xs text-slate-500">Colaborador</div>
                <div className="font-medium text-slate-900">{entry.user}</div>
              </div>
            </div>

            <div className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#0E9C8B] mr-3 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-slate-500">Destino / Motivo</div>
                <div className="font-medium text-slate-900">
                  {entry.destination}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-100">
          <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Fechar
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
