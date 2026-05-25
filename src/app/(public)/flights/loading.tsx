export default function Loading() {
  return (
    <div className="min-h-screen bg-brand-darkest">
      <div className="bg-brand-dark border-b border-brand-steel/10 pt-24 pb-16 animate-pulse">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="h-3 w-36 bg-brand-steel/20 rounded-full mx-auto" />
          <div className="h-12 w-72 bg-brand-steel/20 rounded-xl mx-auto" />
          <div className="h-10 w-80 bg-brand-steel/15 rounded-xl mx-auto mt-4" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-12 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-brand-dark p-5 space-y-4">
              <div className="flex justify-between">
                <div className="space-y-1.5">
                  <div className="h-4 w-28 bg-brand-steel/15 rounded" />
                  <div className="h-3 w-20 bg-brand-steel/10 rounded" />
                </div>
                <div className="h-6 w-20 bg-brand-wine/15 rounded-full" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-1">
                  <div className="h-7 w-16 bg-brand-steel/15 rounded mx-auto" />
                  <div className="h-3 w-20 bg-brand-steel/10 rounded mx-auto" />
                </div>
                <div className="flex-1 flex items-center gap-1">
                  <div className="flex-1 h-px bg-brand-steel/15" />
                  <div className="w-5 h-5 bg-brand-wine/20 rounded-full" />
                  <div className="flex-1 h-px bg-brand-steel/15" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="h-7 w-16 bg-brand-steel/15 rounded mx-auto" />
                  <div className="h-3 w-20 bg-brand-steel/10 rounded mx-auto" />
                </div>
              </div>
              <div className="flex justify-between pt-3 border-t border-brand-steel/10">
                <div className="h-6 w-20 bg-brand-steel/15 rounded" />
                <div className="h-3 w-16 bg-brand-steel/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
