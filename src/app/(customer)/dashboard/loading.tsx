export default function Loading() {
  return (
    <div className="min-h-screen bg-brand-darkest animate-pulse">
      <div className="bg-brand-dark border-b border-brand-steel/10 pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="h-3 w-20 bg-brand-steel/15 rounded mb-2" />
          <div className="h-8 w-64 bg-brand-steel/20 rounded-xl" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Next trip card */}
        <div className="h-28 rounded-2xl bg-brand-dark" />
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-brand-dark" />)}
        </div>
        {/* Recent bookings */}
        <div className="h-6 w-40 bg-brand-steel/20 rounded" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-brand-dark" />)}
        </div>
      </div>
    </div>
  )
}
