export default function Loading() {
  return (
    <div className="min-h-screen bg-brand-darkest animate-pulse">
      <div className="bg-brand-dark border-b border-brand-steel/10 pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="h-8 w-32 bg-brand-steel/20 rounded-xl" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-dark" />
          <div className="space-y-2">
            <div className="h-5 w-40 bg-brand-steel/20 rounded" />
            <div className="h-3 w-28 bg-brand-steel/10 rounded" />
          </div>
        </div>
        {/* Form fields */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-24 bg-brand-steel/15 rounded" />
            <div className="h-10 w-full bg-brand-dark rounded-xl" />
          </div>
        ))}
        <div className="h-10 w-32 bg-brand-wine/20 rounded-xl" />
      </div>
    </div>
  )
}
