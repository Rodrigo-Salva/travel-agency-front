'use client'

import { useEffect, useRef, useState } from 'react'
import { Users, MapPin, Star, Award } from 'lucide-react'

const STATS = [
  { icon: MapPin,  value: 500,  suffix: '+', label: 'Destinos',           duration: 1800 },
  { icon: Users,   value: 10000, suffix: '+', label: 'Viajeros felices',  duration: 2200 },
  { icon: Star,    value: 4.9,  suffix: '★', label: 'Calificación',       duration: 1500, decimals: 1 },
  { icon: Award,   value: 15,   suffix: '+', label: 'Años de experiencia', duration: 1400 },
]

function useCountUp(target: number, duration: number, started: boolean, decimals = 0) {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!started) return
    const start = performance.now()
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(parseFloat((eased * target).toFixed(decimals)))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [started, target, duration, decimals])

  return count
}

function StatItem({ icon: Icon, value, suffix, label, duration, decimals = 0, started }: typeof STATS[0] & { started: boolean }) {
  const count = useCountUp(value, duration, started, decimals)
  const display = decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString()

  return (
    <div className="flex flex-col items-center text-center py-8 px-6 group">
      <div className="w-12 h-12 rounded-xl bg-brand-wine/10 border border-brand-wine/20 flex items-center justify-center mb-4 group-hover:bg-brand-wine/20 group-hover:scale-110 transition-all duration-300">
        <Icon className="h-5 w-5 text-brand-rose" />
      </div>
      <p className="font-display text-4xl font-bold text-white leading-none mb-1">
        {display}<span className="text-brand-rose text-2xl">{suffix}</span>
      </p>
      <p className="text-xs text-brand-steel uppercase tracking-widest mt-1">{label}</p>
    </div>
  )
}

export function StatsCounter() {
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect() } },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="bg-brand-darkest border-y border-brand-steel/10"
      style={{
        transition: 'opacity 700ms ease, transform 700ms ease',
        opacity: started ? 1 : 0,
        transform: started ? 'none' : 'translateY(24px)',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-brand-steel/10">
          {STATS.map(stat => (
            <StatItem key={stat.label} {...stat} started={started} />
          ))}
        </div>
      </div>
    </div>
  )
}
