'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function Wave() {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color('#0a0a2e') },
      uColor2: { value: new THREE.Color('#1a0a3e') },
    }),
    []
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 3, 0, 0]}
      position={[0, -2, 0]}
    >
      <planeGeometry args={[60, 60, 128, 128]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          varying vec2 vUv;
          varying float vElevation;

          void main() {
            vUv = uv;
            vec3 pos = position;
            float elevation = sin(pos.x * 0.5 + uTime * 0.5) * 0.5
                            + sin(pos.y * 0.3 + uTime * 0.3) * 0.8
                            + sin((pos.x + pos.y) * 0.2 + uTime * 0.2) * 0.5;
            pos.z += elevation;
            vElevation = elevation;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uColor1;
          uniform vec3 uColor2;
          varying float vElevation;
          varying vec2 vUv;

          void main() {
            float mixStrength = (vElevation + 1.0) * 0.5;
            vec3 color = mix(uColor1, uColor2, mixStrength);
            gl_FragColor = vec4(color, 0.4);
          }
        `}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function WaveBackground() {
  return (
    <Canvas
      camera={{ position: [0, 5, 10], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <Wave />
    </Canvas>
  );
}
