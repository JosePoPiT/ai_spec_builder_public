function PulseLine({ width = '100%' }: { width?: string }) {
  return (
    <div
      className="h-3.5 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800"
      style={{ width }}
    />
  );
}

function SkeletonCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 h-2.5 w-14 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
      {children}
    </div>
  );
}

export default function SpecSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="h-5 w-44 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />

      {/* Visión */}
      <SkeletonCard>
        <div className="flex flex-col gap-2">
          <PulseLine />
          <PulseLine width="90%" />
          <PulseLine width="72%" />
        </div>
      </SkeletonCard>

      {/* Usuarios */}
      <SkeletonCard>
        <div className="flex flex-col gap-2">
          <PulseLine />
          <PulseLine width="85%" />
          <PulseLine width="68%" />
        </div>
      </SkeletonCard>

      {/* Funcionalidades — checklist rows */}
      <SkeletonCard>
        <div className="flex flex-col gap-3">
          {(['100%', '88%', '95%', '80%', '92%', '76%'] as const).map((w, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-5 w-5 shrink-0 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
              <PulseLine width={w} />
            </div>
          ))}
        </div>
      </SkeletonCard>

      {/* Flujos — step rows */}
      <SkeletonCard>
        <div className="flex flex-col gap-4">
          {(['100%', '85%', '90%', '78%'] as const).map((w, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-6 w-6 shrink-0 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
              <PulseLine width={w} />
            </div>
          ))}
        </div>
      </SkeletonCard>

      {/* Arquitectura */}
      <SkeletonCard>
        <div className="flex flex-col gap-2">
          <PulseLine />
          <PulseLine width="93%" />
          <PulseLine width="78%" />
        </div>
      </SkeletonCard>

      {/* Requisitos */}
      <SkeletonCard>
        <div className="flex flex-col gap-2">
          <PulseLine />
          <PulseLine width="88%" />
          <PulseLine width="64%" />
        </div>
      </SkeletonCard>
    </div>
  );
}
