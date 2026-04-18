export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  destinations: {
    all: ['destinations'] as const,
    list: (filters: Record<string, unknown>) => ['destinations', 'list', filters] as const,
    detail: (id: number | string) => ['destinations', 'detail', id] as const,
  },
  packages: {
    all: ['packages'] as const,
    list: (filters: Record<string, unknown>) => ['packages', 'list', filters] as const,
    detail: (id: number | string) => ['packages', 'detail', id] as const,
    categories: ['packages', 'categories'] as const,
  },
  hotels: {
    all: ['hotels'] as const,
    list: (filters: Record<string, unknown>) => ['hotels', 'list', filters] as const,
    detail: (id: number) => ['hotels', 'detail', id] as const,
  },
  flights: {
    all: ['flights'] as const,
    list: (filters: Record<string, unknown>) => ['flights', 'list', filters] as const,
  },
  activities: {
    all: ['activities'] as const,
    list: (filters: Record<string, unknown>) => ['activities', 'list', filters] as const,
    detail: (id: number) => ['activities', 'detail', id] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    mine: ['bookings', 'mine'] as const,
    detail: (id: number) => ['bookings', 'detail', id] as const,
  },
  reviews: {
    all: ['reviews'] as const,
    byPackage: (packageId: number) => ['reviews', 'package', packageId] as const,
  },
  wishlist: ['wishlist'] as const,
  coupons: ['coupons'] as const,
  inquiries: {
    all: ['inquiries'] as const,
    detail: (id: number) => ['inquiries', 'detail', id] as const,
  },
} as const
