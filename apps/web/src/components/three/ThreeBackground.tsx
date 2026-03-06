'use client';

import dynamic from 'next/dynamic';

const ParticleField = dynamic(
  () => import('./ParticleField').then((mod) => ({ default: mod.ParticleField })),
  {
    ssr: false,
  }
);

export function ThreeBackground() {
  return (
    <div className="fixed inset-0 z-0" style={{ pointerEvents: 'none' }}>
      <ParticleField />
    </div>
  );
}
