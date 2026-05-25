export default function Loading() {
  return (
    <div className="min-h-screen bg-brand-darkest animate-pulse">
      <div className="h-14 bg-brand-dark border-b border-brand-steel/10" />
      <div className="container mx-auto px-4 pt-8 pb-4">
        <div className="h-3 w-44 bg-brand-steel/15 rounded mb-6" />
        <div className="h-10 w-96 bg-brand-steel/20 rounded-xl mb-8" />
        <div className="rounded-2xl h-[340px] bg-brand-dark mb-10" />
      </div>
      <div className="container mx-auto px-4 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3">
              <div className="h-6 w-36 bg-brand-steel/20 rounded" />
              <div className="h-4 w-full bg-brand-steel/10 rounded" />
              <div className="h-4 w-4/5 bg-brand-steel/10 rounded" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-brand-dark" />)}
            </div>
            <div className="h-20 rounded-xl bg-brand-dark" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-brand-dark" />)}
            </div>
          </div>
          <aside className="space-y-5">
            <div className="rounded-2xl bg-brand-dark h-44" />
            <div className="rounded-2xl bg-brand-dark h-36" />
          </aside>
        </div>
      </div>
    </div>
  )
}
