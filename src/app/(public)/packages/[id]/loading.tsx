export default function Loading() {
  return (
    <div className="min-h-screen bg-brand-darkest animate-pulse">
      {/* Top nav */}
      <div className="h-14 bg-brand-dark border-b border-brand-steel/10" />

      <div className="container mx-auto px-4 pt-8 pb-4">
        <div className="h-3 w-48 bg-brand-steel/15 rounded mb-6" />
        <div className="h-10 w-96 bg-brand-steel/20 rounded-xl mb-8" />
        {/* Gallery */}
        <div className="rounded-2xl overflow-hidden mb-10">
          <div className="h-[400px] bg-brand-dark" />
        </div>
      </div>

      <div className="container mx-auto px-4 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3">
              <div className="h-6 w-40 bg-brand-steel/20 rounded" />
              <div className="h-4 w-full bg-brand-steel/10 rounded" />
              <div className="h-4 w-5/6 bg-brand-steel/10 rounded" />
              <div className="h-4 w-4/6 bg-brand-steel/10 rounded" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-xl bg-brand-dark h-20" />
              ))}
            </div>
            <div className="space-y-3">
              <div className="h-6 w-36 bg-brand-steel/20 rounded" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-brand-dark" />
              ))}
            </div>
          </div>
          <aside className="space-y-5">
            <div className="rounded-2xl bg-brand-dark h-48" />
            <div className="rounded-2xl bg-brand-dark h-36" />
          </aside>
        </div>
      </div>
    </div>
  )
}
