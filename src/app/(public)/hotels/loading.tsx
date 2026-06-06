export default function Loading() {
  return (
    <div className="min-h-screen bg-brand-darkest">
      <div className="bg-brand-dark border-b border-brand-steel/10 pt-24 pb-16 animate-pulse">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="h-3 w-28 bg-brand-steel/20 rounded-full mx-auto" />
          <div className="h-12 w-64 bg-brand-steel/20 rounded-xl mx-auto" />
          <div className="h-4 w-80 bg-brand-steel/10 rounded mx-auto" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-12 animate-pulse">
        <div className="flex gap-3 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-9 w-28 bg-brand-dark rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-brand-dark overflow-hidden">
              <div className="h-48 bg-brand-steel/10" />
              <div className="p-5 space-y-3">
                <div className="flex gap-1">
                  {[...Array(4)].map((_, j) => <div key={j} className="h-3 w-3 bg-brand-steel/20 rounded" />)}
                </div>
                <div className="h-4 w-3/4 bg-brand-steel/15 rounded" />
                <div className="h-3 w-full bg-brand-steel/10 rounded" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-6 w-24 bg-brand-steel/15 rounded" />
                  <div className="h-8 w-24 bg-brand-wine/20 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
