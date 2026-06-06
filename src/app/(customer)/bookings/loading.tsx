export default function Loading() {
  return (
    <div className="min-h-screen bg-brand-darkest animate-pulse">
      <div className="bg-brand-dark border-b border-brand-steel/10 pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="h-8 w-48 bg-brand-steel/20 rounded-xl" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 space-y-4">
        {/* Filter tabs */}
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-8 w-24 bg-brand-dark rounded-xl" />)}
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-brand-dark p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-steel/15 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-brand-steel/15 rounded" />
              <div className="h-3 w-64 bg-brand-steel/10 rounded" />
            </div>
            <div className="space-y-2 text-right">
              <div className="h-5 w-20 bg-brand-wine/15 rounded-full" />
              <div className="h-4 w-16 bg-brand-steel/15 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
