export default function Loading() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-white relative flex flex-col h-full animate-pulse">
          <div className="relative aspect-square overflow-hidden rounded-t-lg bg-[rgba(0,0,0,0.06)]" />
          <div className="p-3 sm:p-2 flex-1 flex flex-col">
            <div className="h-4 sm:h-3 bg-gray-200 rounded w-5/6 mb-2" />
            <div className="h-3 sm:h-2 bg-gray-200 rounded w-3/5 mb-2" />
            <div className="h-5 sm:h-4 bg-gray-200 rounded w-2/5 mt-2" />
            <div className="mt-3 sm:mt-2">
              <div className="h-9 sm:h-8 rounded-md bg-gray-200 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}