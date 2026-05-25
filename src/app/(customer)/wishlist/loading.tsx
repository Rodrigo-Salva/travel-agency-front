export default function Loading() {
  return (
    <div className="min-h-screen bg-brand-darkest animate-pulse">
      <div className="bg-brand-dark border-b border-brand-steel/10 pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="h-8 w-44 bg-brand-steel/20 rounded-xl" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-brand-dark overflow-hidden">
              <div className="h-48 bg-brand-steel/10" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-brand-steel/15 rounded" />
                <div className="h-3 w-1/2 bg-brand-steel/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
