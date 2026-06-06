'use client'

import { useState } from 'react'
import { Clock, X } from 'lucide-react'

const PRESETS = [
  { label: 'Ahora',  ms: 0 },
  { label: '5 min',  ms: 5 * 60 * 1000 },
  { label: '1 h',    ms: 60 * 60 * 1000 },
  { label: '24 h',   ms: 24 * 60 * 60 * 1000 },
]

interface Props {
  value: number
  onChange: (ms: number) => void
}

export function DelayPicker({ value, onChange }: Props) {
  const [showCustom, setShowCustom] = useState(false)
  const [customMinutes, setCustomMinutes] = useState('')

  const activePreset = PRESETS.find(p => p.ms === value)
  const isCustomActive = value > 0 && !activePreset

  const applyCustom = () => {
    const mins = parseInt(customMinutes, 10)
    if (mins > 0) {
      onChange(mins * 60 * 1000)
      setShowCustom(false)
    }
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Clock className="h-3.5 w-3.5 text-brand-steel/50 shrink-0" />

      {PRESETS.map(preset => (
        <button
          key={preset.ms}
          type="button"
          onClick={() => { onChange(preset.ms); setShowCustom(false) }}
          className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
            value === preset.ms && !showCustom
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 font-medium'
              : 'border-white/10 text-brand-steel/60 hover:border-white/20 hover:text-brand-steel'
          }`}
        >
          {preset.label}
        </button>
      ))}

      {/* Custom button or active custom indicator */}
      {!showCustom && !isCustomActive && (
        <button
          type="button"
          onClick={() => setShowCustom(true)}
          className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 text-brand-steel/60 hover:border-white/20 hover:text-brand-steel transition-all"
        >
          Personalizado
        </button>
      )}

      {/* Custom input inline */}
      {showCustom && (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            type="number"
            min={1}
            max={10080}
            placeholder="min"
            value={customMinutes}
            onChange={e => setCustomMinutes(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyCustom()}
            className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-emerald-500/50"
          />
          <span className="text-[11px] text-brand-steel/50">min</span>
          <button
            type="button"
            onClick={applyCustom}
            disabled={!customMinutes || parseInt(customMinutes) < 1}
            className="text-[11px] px-2 py-1 rounded-full bg-emerald-600/80 hover:bg-emerald-600 disabled:opacity-40 text-white transition-colors"
          >
            OK
          </button>
          <button
            type="button"
            onClick={() => setShowCustom(false)}
            className="text-brand-steel/40 hover:text-brand-steel"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Active custom display */}
      {isCustomActive && (
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            +{Math.round(value / 60000)} min
          </span>
          <button
            type="button"
            onClick={() => onChange(0)}
            className="text-brand-steel/40 hover:text-red-400 transition-colors"
            title="Quitar delay"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
