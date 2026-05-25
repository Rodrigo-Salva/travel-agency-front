export default function Loading() {
  return (
    <div className="p-6 space-y-8 animate-pulse">
      <div className="space-y-1">
        <div className="h-3 w-28 bg-brand-steel/15 rounded" />
        <div className="h-8 w-40 bg-brand-steel/20 rounded-xl" />
      </div>
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-brand-dark" />)}
      </div>
      {/* Status row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-brand-dark" />)}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 rounded-2xl bg-brand-dark" />
        <div className="h-64 rounded-2xl bg-brand-dark" />
      </div>
      {/* Quick links */}
      <div className="h-5 w-36 bg-brand-steel/20 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-brand-dark" />)}
      </div>
    </div>
  )
}
