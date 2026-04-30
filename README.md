# Travel Agency — Frontend

Frontend de una agencia de viajes premium construido con Next.js 16, TypeScript y Tailwind CSS v4. Consume la API REST del backend Django.

---

## Stack tecnológico

| Categoría | Tecnología |
|-----------|-----------|
| Framework | Next.js 16.2.4 (App Router) |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS v4 |
| Componentes | shadcn/ui + @base-ui/react |
| Estado global | Zustand 5 |
| Data fetching | TanStack Query v5 |
| Formularios | React Hook Form + Zod v4 |
| HTTP client | Axios |
| Notificaciones | Sonner |
| Iconos | Lucide React |

---

## Requisitos previos

- Node.js 18+
- Backend Django corriendo en `http://localhost:8000`

---

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Rodrigo-Salva/travel-agency-front.git
cd travel-agency-front

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
```

Editar `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1/
```

---

## Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo con Turbopack
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Linter ESLint
```

---

## Estructura del proyecto

```
src/
├── app/
│   ├── (public)/          # Rutas públicas (home, destinos, paquetes, hoteles, actividades)
│   ├── (auth)/            # Login y registro
│   ├── (customer)/        # Área privada del cliente (reservas, perfil)
│   └── (admin)/           # Panel de administración
│
├── features/              # Lógica por dominio
│   ├── auth/              # Autenticación: store, hooks, API, tipos
│   ├── destinations/      # Destinos
│   ├── packages/          # Paquetes turísticos
│   ├── hotels/            # Hoteles
│   ├── activities/        # Actividades
│   ├── bookings/          # Reservas y wizard
│   └── reviews/           # Reseñas
│
├── components/
│   ├── layout/            # Navbar y Footer
│   ├── home/              # HeroSection
│   └── ui/                # Componentes shadcn/ui
│
├── lib/
│   ├── api/               # Axios client y endpoints
│   ├── query/             # QueryClient y query keys
│   ├── utils/             # Formatters y utilidades
│   └── constants/         # Rutas tipadas (ROUTES)
│
├── providers/             # QueryProvider, AuthProvider
├── proxy.ts               # Protección de rutas (Edge Runtime)
└── types/                 # Tipos globales de la API
```

---

## Módulos del sistema

### Área pública
- **Home** — Hero, destinos destacados y paquetes destacados
- **Destinos** — Listado con filtros por continente, país y búsqueda
- **Paquetes** — Catálogo con filtros, detalle con itinerario y reseñas
- **Hoteles** — Listado con filtro por estrellas y ordenamiento por precio
- **Actividades** — Filtros por tipo (8 categorías) y dificultad

### Área cliente (requiere login)
- **Mis reservas** — Listado de reservas con estado y opción de cancelar
- **Wizard de reserva** — Formulario de 4 pasos: fechas → pasajeros → resumen → confirmación

### Panel admin (requiere rol admin)
| Módulo | Funciones |
|--------|-----------|
| Dashboard | Estadísticas de revenue, reservas por estado, tabla reciente |
| Destinos | Listado + crear/editar en modal + eliminar |
| Paquetes | Listado + crear/editar en modal + eliminar |
| Hoteles | Listado con estrellas y precio por noche |
| Actividades | Listado con tipo, dificultad y duración |
| Vuelos | Listado con aerolínea, ruta y horarios |
| Reservas | Gestión con filtro por estado y cancelación |
| Reseñas | Moderación: aprobar o eliminar |
| Consultas | Bandeja con cambio de estado (Nueva → Cerrada) |
| Cupones | Listado con descuento y vigencia |
| Usuarios | Listado con rol y desactivación de cuenta |

---

## Autenticación

- JWT con access token en memoria y refresh token en `sessionStorage`
- Refresh automático silencioso en cada petición con 401
- Protección de rutas en Edge Runtime via `proxy.ts`
- Redirección por rol: `admin` → `/admin`, `customer` → `/dashboard`

---

## Paleta de colores

| Variable | Color | Uso |
|----------|-------|-----|
| `brand-wine` | `#622347` | Acción primaria, botones, accents |
| `brand-dark` | `#122E34` | Fondos de cards y secciones |
| `brand-darkest` | `#0E1D21` | Fondo principal |
| `brand-silver` | `#ABAFB5` | Texto secundario |
| `brand-steel` | `#677E8A` | Iconos y texto muted |
| `brand-rose` | `#E0B4B2` | Accents claros |

---

## Ramas

| Rama | Descripción |
|------|-------------|
| `main` | Código estable de producción |
| `develop` | Integración de features en desarrollo |
| `test` | Validación antes de pasar a producción |

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL base de la API Django | `http://localhost:8000/api/v1/` |
