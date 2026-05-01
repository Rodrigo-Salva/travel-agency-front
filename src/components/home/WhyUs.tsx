import { Shield, HeadphonesIcon, Globe, Award, Clock, CreditCard } from 'lucide-react'

const FEATURES = [
  {
    icon: Shield,
    title: 'Viajes seguros',
    desc: 'Todos nuestros paquetes incluyen seguro de viaje y asistencia 24/7 en caso de emergencia.',
  },
  {
    icon: HeadphonesIcon,
    title: 'Soporte continuo',
    desc: 'Nuestro equipo está disponible antes, durante y después de tu viaje para cualquier consulta.',
  },
  {
    icon: Globe,
    title: '+500 destinos',
    desc: 'Cubrimos destinos en los 5 continentes con operadores locales de confianza.',
  },
  {
    icon: Award,
    title: 'Calidad garantizada',
    desc: 'Todos los hoteles y servicios son verificados para asegurar la mejor experiencia.',
  },
  {
    icon: Clock,
    title: 'Reserva en minutos',
    desc: 'Proceso simple y rápido. Reserva tu viaje en menos de 5 minutos desde cualquier dispositivo.',
  },
  {
    icon: CreditCard,
    title: 'Pago seguro',
    desc: 'Múltiples métodos de pago con cifrado de datos y transacciones 100% seguras.',
  },
]

export function WhyUs() {
  return (
    <section className="py-20 bg-brand-dark border-t border-brand-steel/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-brand-wine text-sm font-semibold uppercase tracking-widest mb-3">
            Por qué elegirnos
          </p>
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            Tu viaje, nuestra prioridad
          </h2>
          <p className="text-brand-silver text-lg max-w-2xl mx-auto">
            Más de 10,000 viajeros confían en nosotros cada año para crear experiencias inolvidables.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl bg-brand-darkest border border-brand-steel/10 p-6 hover:border-brand-wine/20 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-wine/10 border border-brand-wine/20 flex items-center justify-center mb-4 group-hover:bg-brand-wine/20 transition-colors">
                <Icon className="h-6 w-6 text-brand-rose" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-brand-silver text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
