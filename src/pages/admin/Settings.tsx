import { Settings as SettingsIcon } from 'lucide-react'

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Configurações
        </h1>
        <p className="text-sm text-slate-500">Ajustes gerais do sistema.</p>
      </div>

      <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-white rounded-xl border border-dashed border-slate-200">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
          <SettingsIcon className="w-10 h-10 text-slate-300" />
        </div>
        <div className="max-w-xs">
          <h3 className="text-lg font-semibold text-slate-900">Em Breve</h3>
          <p className="text-slate-500 mt-2 text-sm">
            Novas configurações de personalização e gestão de usuários estarão
            disponíveis aqui.
          </p>
        </div>
      </div>
    </div>
  )
}
