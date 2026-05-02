'use client';

import { useEffect, useRef, useState } from 'react';
import SpecForm from '@/components/SpecForm';
import SpecOutput from '@/components/SpecOutput';
import SpecSkeleton from '@/components/SpecSkeleton';
import { type Spec } from '@/lib/types';

export default function Home() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [spec, setSpec] = useState<Spec | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }, [loading]);

  function handleReset() {
    setSpec(null);
    setDescription('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="flex min-h-full flex-col items-center bg-zinc-50 px-4 py-16 dark:bg-zinc-950">
      <main className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            AI Spec Builder
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Describe tu idea y genera una especificación técnica en segundos.
          </p>
        </div>

        <SpecForm
          description={description}
          onDescriptionChange={setDescription}
          onResult={setSpec}
          onLoadingChange={setLoading}
        />

        {(loading || spec) && (
          <div ref={outputRef} className="mt-10 scroll-mt-8">
            {loading ? (
              <SpecSkeleton />
            ) : (
              spec && <SpecOutput spec={spec} onReset={handleReset} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
