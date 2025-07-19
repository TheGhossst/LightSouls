'use client'

export default function GameLoading() {
  return (
    <div className="flex justify-center py-12">
      <div className="flex items-center space-x-3">
        <span className="font-mono text-zinc-400">Generating story</span>
        <span className="font-mono text-zinc-400 animate-pulse">...</span>
      </div>
    </div>
  );
}
