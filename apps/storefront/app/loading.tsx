export default function Loading() {
  return (
    <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-24">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-800"
          aria-hidden
        />
        <p className="text-sm text-zinc-500">Loading…</p>
      </div>
    </div>
  );
}
