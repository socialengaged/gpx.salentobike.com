export default function RouteDetailLoading() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-shrink-0 px-4 py-3 flex items-center gap-3">
        <div className="h-5 w-36 bg-slate-200 rounded animate-pulse" />
        <div className="h-6 w-20 bg-slate-200 rounded-full animate-pulse" />
        <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse" />
      </div>
      <div className="flex-shrink-0 px-4 pb-2">
        <div className="h-4 w-52 bg-slate-200 rounded animate-pulse" />
      </div>
      <div className="flex-1 min-h-[65vh] bg-slate-200 animate-pulse" />
      <div className="flex-shrink-0 p-4 bg-white border-t border-slate-200 space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-slate-200 rounded animate-pulse" />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-12 bg-slate-200 rounded animate-pulse" />
          <div className="h-10 bg-slate-200 rounded animate-pulse" />
          <div className="h-10 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
