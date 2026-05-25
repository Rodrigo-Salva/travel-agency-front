export default function Loading() {
  return (
    <div className="min-h-screen bg-brand-darkest animate-pulse">
      <div className="h-[450px] bg-brand-dark" />
      <div className="container mx-auto px-4 py-10 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3">
              <div className="h-6 w-36 bg-brand-steel/20 rounded" />
              <div className="h-4 w-full bg-brand-steel/10 rounded" />
              <div className="h-4 w-5/6 bg-brand-steel/10 rounded" />
              <div className="h-4 w-4/6 bg-brand-steel/10 rounded" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-52 rounded-2xl bg-brand-dark" />)}
            </div>
          </div>
          <aside className="space-y-5">
            <div className="h-52 rounded-2xl bg-brand-dark" />
            <div className="h-36 rounded-2xl bg-brand-dark" />
          </aside>
        </div>
      </div>
    </div>
  )
}
