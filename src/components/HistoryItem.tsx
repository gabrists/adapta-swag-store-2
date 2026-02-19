import { HistoryEntry } from '@/types'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface HistoryItemProps {
  entry: HistoryEntry
}

export function HistoryItem({ entry }: HistoryItemProps) {
  const imageUrl = entry.productImageQuery.startsWith('http')
    ? entry.productImageQuery
    : `https://img.usecurling.com/p/100/100?q=${entry.productImageQuery}&dpr=2`

  const date = parseISO(entry.date)

  return (
    <div className="flex items-center p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <Avatar className="h-12 w-12 border border-slate-200 mr-4">
        <AvatarImage
          src={imageUrl}
          alt={entry.productName}
          className="object-cover"
        />
        <AvatarFallback>
          {entry.productName.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-slate-900 truncate">
            {entry.productName}
          </h4>
          {entry.size && (
            <Badge
              variant="outline"
              className="text-[10px] h-5 px-1.5 border-primary text-primary bg-primary/5"
            >
              {entry.size}
            </Badge>
          )}
        </div>
        <p className="text-sm text-slate-500 truncate">
          Retirado por{' '}
          <span className="font-medium text-slate-700">{entry.user}</span>
        </p>
      </div>

      <div className="text-right pl-4">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
          Destino
        </div>
        <div className="text-sm font-medium text-slate-800 max-w-[150px] truncate">
          {entry.destination}
        </div>
        <div className="text-xs text-slate-400 mt-1">
          {format(date, "d 'de' MMMM", { locale: ptBR })}
        </div>
      </div>
    </div>
  )
}
