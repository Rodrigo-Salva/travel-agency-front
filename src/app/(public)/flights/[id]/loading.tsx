export default function Loading() {
  return (
    <div className="min-h-screen bg-brand-darkest animate-pulse">
      <div className="h-14 bg-brand-dark border-b border-brand-steel/10" />
      <div className="bg-brand-dark border-b border-brand-steel/10 pt-8 pb-12">
        <div className="container mx-auto px-4">
          <div className="h-3 w-48 bg-brand-steel/15 rounded mb-6" />
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-2">
              <div className="h-3 w-24 bg-brand-steel/15 rounded" />
              <div className="h-12 w-80 bg-brand-steel/20 rounded-xl" />
            </div>
            <div className="space-y-1 text-right">
              <div className="h-3 w-24 bg-brand-steel/15 rounded ml-auto" />
              <div className="h-10 w-32 bg-brand-steel/20 rounded-xl ml-auto" />
            </div>
          </div>
          <div className="rounded-2xl bg-brand-dark/60 border border-brand-steel/15 p-6 max-w-3xl h-36" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-44 rounded-2xl bg-brand-dark" />
            <div className="h-36 rounded-2xl bg-brand-dark" />
            <div className="h-32 rounded-2xl bg-brand-dark" />
          </div>
          <aside className="space-y-5">
            <div className="h-44 rounded-2xl bg-brand-dark" />
            <div className="h-28 rounded-2xl bg-brand-dark" />
            <div className="h-36 rounded-2xl bg-brand-dark" />
          </aside>
        </div>
      </div>
    </div>
  )
}
