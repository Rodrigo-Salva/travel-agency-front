export default function Loading() {
  return (
    <div className="min-h-screen bg-brand-darkest animate-pulse">
      <div className="bg-brand-dark border-b border-brand-steel/10 pt-14 pb-10">
        <div className="container mx-auto px-4">
          <div className="h-3 w-20 bg-brand-steel/15 rounded mb-3" />
          <div className="h-8 w-64 bg-brand-steel/20 rounded-xl" />
          <div className="h-3 w-40 bg-brand-steel/10 rounded mt-2" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-10 max-w-4xl space-y-6">
        <div className="h-28 rounded-2xl bg-brand-dark" />
        <div className="h-20 rounded-2xl bg-brand-dark" />
        <div className="h-36 rounded-2xl bg-brand-dark" />
        <div className="h-48 rounded-2xl bg-brand-dark" />
        <div className="h-32 rounded-2xl bg-brand-dark" />
      </div>
    </div>
  )
}
