'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function Particles() {
  const meshRef = useRef<THREE.Points>(null);
  const count = 2000;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Spread particles in a large box
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;

      // Alternate between cyan (#00f0ff) and purple (#8b5cf6) with variations
      if (Math.random() > 0.5) {
        col[i * 3] = 0 + Math.random() * 0.1;
        col[i * 3 + 1] = 0.85 + Math.random() * 0.15;
        col[i * 3 + 2] = 0.9 + Math.random() * 0.1;
      } else {
        col[i * 3] = 0.45 + Math.random() * 0.1;
        col[i * 3 + 1] = 0.25 + Math.random() * 0.1;
        col[i * 3 + 2] = 0.85 + Math.random() * 0.15;
      }
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    meshRef.current.rotation.x =
      Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export function ParticleField() {
  return (
    <Canvas
      camera={{ position: [0, 0, 15], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <Particles />
    </Canvas>
  );
}
