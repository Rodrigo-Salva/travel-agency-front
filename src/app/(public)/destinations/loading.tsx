export default function Loading() {
  return (
    <div className="min-h-screen bg-brand-darkest">
      <div className="h-[420px] bg-brand-dark animate-pulse" />
      <div className="container mx-auto px-4 py-12 animate-pulse">
        <div className="flex gap-3 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-9 w-28 bg-brand-dark rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-brand-dark overflow-hidden aspect-[4/3]">
              <div className="h-full bg-brand-steel/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
