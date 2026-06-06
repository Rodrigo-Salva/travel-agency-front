export default function Loading() {
  return (
    <div className="min-h-screen bg-brand-darkest animate-pulse">
      <div className="bg-brand-dark border-b border-brand-steel/10 pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="h-3 w-24 bg-brand-steel/15 rounded mb-3" />
          <div className="h-8 w-52 bg-brand-steel/20 rounded-xl" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-4">
        <div className="h-3 w-20 bg-brand-steel/15 rounded mb-2" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-brand-dark border border-brand-wine/10">
            <div className="w-10 h-10 rounded-xl bg-brand-wine/10 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 bg-brand-steel/20 rounded" />
              <div className="h-3 w-full bg-brand-steel/10 rounded" />
              <div className="h-3 w-2/3 bg-brand-steel/10 rounded" />
            </div>
            <div className="h-3 w-16 bg-brand-steel/10 rounded flex-shrink-0" />
          </div>
        ))}
        <div className="h-3 w-20 bg-brand-steel/15 rounded mt-6 mb-2" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-brand-dark border border-brand-steel/10">
            <div className="w-10 h-10 rounded-xl bg-brand-steel/10 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-brand-steel/15 rounded" />
              <div className="h-3 w-full bg-brand-steel/10 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
