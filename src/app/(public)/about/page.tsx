import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Users, Award, Heart, Shield, Globe, ArrowRight, CheckCircle } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'

export const metadata = {
  title: 'Quiénes Somos — TravelAgency',
  description: 'Conoce al equipo detrás de TravelAgency. Más de 15 años creando experiencias de viaje únicas e inolvidables en Perú y el mundo.',
}

const TEAM = [
  {
    name: 'Laura Mendoza',
    role: 'Fundadora & CEO',
    bio: '15 años diseñando rutas por los 5 continentes. Apasionada por conectar personas con culturas.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    trips: '80+ países',
  },
  {
    name: 'Marco Villanueva',
    role: 'Director de Experiencias',
    bio: 'Ex guía de montaña. Especialista en aventura, trekking y destinos fuera de lo común.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    trips: '120+ rutas',
  },
  {
    name: 'Sofía Castillo',
    role: 'Jefa de Atención al Viajero',
    bio: 'Garantiza que cada cliente tenga soporte 24/7 y que ningún detalle quede al azar.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    trips: '10K+ clientes',
  },
  {
    name: 'Andrés Quispe',
    role: 'Especialista en Perú & Latinoamérica',
    bio: 'Nació en Cusco. Conoce cada rincón del Perú y arma itinerarios que enamoran.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    trips: '50+ destinos locales',
  },
]

const VALUES = [
  { icon: Heart,   title: 'Pasión por los viajes',   desc: 'Cada paquete lo diseñamos como si fuera para nosotros mismos.' },
  { icon: Shield,  title: 'Transparencia total',      desc: 'Sin costos ocultos. Lo que ves es exactamente lo que obtienes.' },
  { icon: Users,   title: 'Atención personalizada',   desc: 'Un asesor dedicado para ti desde el primer contacto hasta el regreso.' },
  { icon: Globe,   title: 'Red global de confianza',  desc: 'Alianzas con los mejores operadores locales en cada destino.' },
  { icon: Award,   title: 'Calidad comprobada',        desc: 'Todos nuestros proveedores son auditados y certificados anualmente.' },
  { icon: CheckCircle, title: 'Viaje garantizado',    desc: 'Si algo falla por causas ajenas, lo resolvemos sin costo extra.' },
]

const MILESTONES = [
  { year: '2009', event: 'Fundación en Lima con 3 personas y una oficina pequeña.' },
  { year: '2012', event: 'Primer paquete internacional: Machu Picchu — Miami.' },
  { year: '2016', event: 'Alcanzamos los 1,000 viajeros felices.' },
  { year: '2019', event: 'Apertura de sucursal en Cusco y Arequipa.' },
  { year: '2022', event: 'Lanzamos la plataforma digital para reservas en línea.' },
  { year: '2024', event: 'Superamos los 10,000 viajeros y 500 destinos.' },
]

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-[55vh] flex items-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80"
          alt="Nosotros"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-brand-darkest" />

        <div className="relative z-10 container mx-auto px-4 text-center py-24">
          <p className="section-label mb-4">Quiénes somos</p>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
            Creamos viajes que <span className="text-gradient-brand italic">transforman</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
            Desde 2009, ayudamos a miles de viajeros a descubrir el mundo de manera auténtica,
            segura y memorable. Somos más que una agencia: somos tu compañero de aventuras.
          </p>
        </div>
      </section>

      {/* Stats rápidos */}
      <div className="bg-brand-darkest border-b border-brand-steel/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-brand-steel/10">
            {[
              { value: '15+', label: 'Años de experiencia' },
              { value: '500+', label: 'Destinos' },
              { value: '10K+', label: 'Viajeros felices' },
              { value: '4.9★', label: 'Calificación promedio' },
            ].map(s => (
              <div key={s.label} className="py-7 px-6 text-center">
                <p className="font-display text-3xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-brand-steel uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historia */}
      <section className="py-24 bg-brand-dark">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="section-label mb-3">Nuestra historia</p>
              <h2 className="font-display text-4xl font-bold text-white mb-6 leading-tight">
                De una pequeña oficina a <span className="text-gradient-brand italic">miles de destinos</span>
              </h2>
              <p className="text-brand-silver/70 leading-relaxed mb-4">
                Todo comenzó en 2009 con una idea simple: que viajar no debería ser complicado ni estresante.
                Laura Mendoza, nuestra fundadora, había trabajado años como guía de turismo y sabía de primera
                mano que los viajeros necesitaban alguien de confianza que los acompañara en cada paso.
              </p>
              <p className="text-brand-silver/70 leading-relaxed mb-8">
                Hoy somos un equipo de 40 personas apasionadas por los viajes, con oficinas en Lima, Cusco
                y Arequipa, y alianzas en más de 60 países. Pero seguimos con la misma filosofía del primer día:
                cada viaje es único, y merece atención única.
              </p>
              <Link href={ROUTES.contact}
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-rose hover:text-white transition-colors group">
                Hablar con un asesor <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Timeline */}
            <div className="space-y-0">
              {MILESTONES.map((m, i) => (
                <div key={m.year} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 transition-colors ${i === MILESTONES.length - 1 ? 'bg-brand-wine' : 'bg-brand-steel/40 group-hover:bg-brand-wine'}`} />
                    {i < MILESTONES.length - 1 && <div className="w-px flex-1 bg-brand-steel/20 mt-1" />}
                  </div>
                  <div className="pb-6">
                    <span className="text-xs font-bold text-brand-rose uppercase tracking-widest">{m.year}</span>
                    <p className="text-brand-silver/80 text-sm mt-0.5 leading-relaxed">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-24 bg-brand-darkest">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Nuestros valores</p>
            <h2 className="font-display text-4xl font-bold text-white leading-tight">
              Lo que nos <span className="text-gradient-brand italic">define</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl p-6 bg-brand-dark border border-brand-steel/10 card-depth hover:card-depth-hover hover:-translate-y-0.5 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-brand-wine/10 border border-brand-wine/20 flex items-center justify-center mb-4 group-hover:bg-brand-wine/20 transition-all">
                  <Icon className="h-5 w-5 text-brand-rose" />
                </div>
                <h3 className="font-bold text-white mb-2 group-hover:text-brand-rose transition-colors">{title}</h3>
                <p className="text-brand-silver/70 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="py-24 bg-brand-dark">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="section-label mb-3">El equipo</p>
            <h2 className="font-display text-4xl font-bold text-white leading-tight">
              Las personas detrás de <span className="text-gradient-brand italic">cada viaje</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map(member => (
              <div key={member.name} className="rounded-2xl bg-brand-darkest border border-brand-steel/10 card-depth overflow-hidden hover:card-depth-hover hover:-translate-y-1 transition-all duration-300 group">
                <div className="relative h-52 overflow-hidden bg-brand-dark">
                  <Image src={member.avatar} alt={member.name} fill
                    className="object-cover group-hover:scale-[1.06] transition-transform duration-700 ease-out"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-darkest/80 to-transparent" />
                  <span className="absolute bottom-3 left-3 text-[11px] font-medium px-2.5 py-1 rounded-full bg-brand-darkest/80 backdrop-blur-sm border border-brand-steel/20 text-brand-silver">
                    {member.trips}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-white group-hover:text-brand-rose transition-colors">{member.name}</h3>
                  <p className="text-xs text-brand-rose font-semibold uppercase tracking-wide mt-0.5 mb-2">{member.role}</p>
                  <p className="text-xs text-brand-silver/70 leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-darkest border-t border-brand-steel/10">
        <div className="container mx-auto px-4 text-center">
          <MapPin className="h-8 w-8 text-brand-rose mx-auto mb-4" />
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            ¿Listo para tu próxima aventura?
          </h2>
          <p className="text-brand-silver/70 mb-8 max-w-lg mx-auto">
            Hablemos. Diseñamos el viaje de tus sueños sin costo de asesoría.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href={ROUTES.contact}
              className="inline-flex items-center gap-2 h-12 px-8 rounded-lg bg-brand-wine hover:bg-brand-wine/90 text-white font-semibold transition-all glow-wine-sm">
              Consultar ahora
            </Link>
            <Link href={ROUTES.packages}
              className="inline-flex items-center gap-2 h-12 px-8 rounded-lg border border-brand-steel/30 text-brand-silver hover:text-white hover:bg-brand-dark font-semibold transition-all">
              Ver paquetes
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
