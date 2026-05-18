import { Shield, HeadphonesIcon, Globe, Award, Clock, CreditCard } from 'lucide-react'

const FEATURES = [
  { icon: Shield,         title: 'Viajes seguros',      desc: 'Todos nuestros paquetes incluyen seguro de viaje y asistencia 24/7.' },
  { icon: HeadphonesIcon, title: 'Soporte continuo',    desc: 'Nuestro equipo está disponible antes, durante y después de tu viaje.' },
  { icon: Globe,          title: '+500 destinos',        desc: 'Cubrimos destinos en los 5 continentes con operadores locales de confianza.' },
  { icon: Award,          title: 'Calidad garantizada', desc: 'Todos los hoteles y servicios son verificados para asegurar la mejor experiencia.' },
  { icon: Clock,          title: 'Reserva en minutos',  desc: 'Proceso simple y rápido. Reserva tu viaje en menos de 5 minutos.' },
  { icon: CreditCard,     title: 'Pago seguro',         desc: 'Múltiples métodos de pago con cifrado de datos y transacciones 100% seguras.' },
]

export function WhyUs() {
  return (
    <section className="py-24 bg-brand-dark relative overflow-hidden">
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-14">
          <p className="section-label mb-3">Por qué elegirnos</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
            Tu viaje, <span className="text-gradient-brand italic">nuestra prioridad</span>
          </h2>
          <p className="text-brand-silver/70 text-lg max-w-2xl mx-auto">
            Más de 10,000 viajeros confían en nosotros cada año para crear experiencias inolvidables.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl p-6 bg-brand-darkest border border-brand-steel/10 card-depth hover:card-depth-hover hover:-translate-y-0.5 transition-all duration-300 group">
              <div className="w-11 h-11 rounded-xl bg-brand-wine/10 border border-brand-wine/20 flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-wine/20">
                <Icon className="h-5 w-5 text-brand-rose" />
              </div>
              <h3 className="font-display font-bold text-white mb-2.5 group-hover:text-brand-rose transition-colors">{title}</h3>
              <p className="text-brand-silver/70 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
