export default function Loading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 bg-brand-steel/20 rounded-xl" />
        <div className="h-9 w-32 bg-brand-wine/20 rounded-xl" />
      </div>
      {/* Filters */}
      <div className="flex gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-9 w-28 bg-brand-dark rounded-xl" />)}
      </div>
      {/* Table */}
      <div className="rounded-2xl bg-brand-dark overflow-hidden">
        <div className="h-12 bg-brand-steel/10 border-b border-brand-steel/10" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-brand-steel/5">
            <div className="h-4 w-24 bg-brand-steel/15 rounded" />
            <div className="h-4 w-32 bg-brand-steel/10 rounded" />
            <div className="h-4 w-24 bg-brand-steel/10 rounded" />
            <div className="h-5 w-20 bg-brand-wine/15 rounded-full ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
