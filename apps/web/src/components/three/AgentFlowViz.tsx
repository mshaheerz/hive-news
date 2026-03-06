'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Line } from '@react-three/drei';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface CompanyData {
  name: string;
  ceo: string;
  reporters: string[];
}

interface AgentFlowVizProps {
  companies?: CompanyData[];
}

interface NodeDef {
  id: string;
  label: string;
  position: [number, number, number];
  type: 'company' | 'ceo' | 'reporter';
  color: string;
}

interface EdgeDef {
  from: [number, number, number];
  to: [number, number, number];
}

/* -------------------------------------------------------------------------- */
/*  Demo data                                                                 */
/* -------------------------------------------------------------------------- */

const DEMO_COMPANIES: CompanyData[] = [
  {
    name: 'NeuraCorp',
    ceo: 'Aria Chen',
    reporters: ['Tech', 'Finance', 'Science'],
  },
  {
    name: 'QuantumEdge',
    ceo: 'Marcus Holt',
    reporters: ['Health', 'Politics'],
  },
  {
    name: 'SynthWave AI',
    ceo: 'Lena Park',
    reporters: ['Culture', 'Sports', 'Tech'],
  },
];

const REPORTER_COLORS: Record<string, string> = {
  Tech: '#00f0ff',
  Finance: '#f0c040',
  Science: '#40f080',
  Health: '#ff6090',
  Politics: '#f08040',
  Culture: '#c080ff',
  Sports: '#80d0ff',
};

/* -------------------------------------------------------------------------- */
/*  Layout helpers                                                            */
/* -------------------------------------------------------------------------- */

function buildGraph(companies: CompanyData[]) {
  const nodes: NodeDef[] = [];
  const edges: EdgeDef[] = [];

  const total = companies.length;
  const spreadAngle = (2 * Math.PI) / total;

  companies.forEach((company, ci) => {
    const angle = ci * spreadAngle - Math.PI / 2;
    const radius = 6;

    // Company node
    const cx = Math.cos(angle) * radius;
    const cy = Math.sin(angle) * radius;
    const cz = (Math.random() - 0.5) * 2;
    const companyPos: [number, number, number] = [cx, cy, cz];

    nodes.push({
      id: `company-${ci}`,
      label: company.name,
      position: companyPos,
      type: 'company',
      color: '#8b5cf6',
    });

    // CEO node – offset towards centre
    const ceoAngle = angle;
    const ceoR = radius * 0.55;
    const ceoPos: [number, number, number] = [
      Math.cos(ceoAngle) * ceoR,
      Math.sin(ceoAngle) * ceoR,
      cz + 0.5,
    ];

    nodes.push({
      id: `ceo-${ci}`,
      label: company.ceo,
      position: ceoPos,
      type: 'ceo',
      color: '#00f0ff',
    });

    edges.push({ from: companyPos, to: ceoPos });

    // Reporter nodes – fan out from CEO
    const repCount = company.reporters.length;
    company.reporters.forEach((rep, ri) => {
      const repSpread = 1.2;
      const repAngleOffset =
        (ri - (repCount - 1) / 2) * repSpread * 0.35 + angle;
      const repR = radius * 0.2;
      const repPos: [number, number, number] = [
        ceoPos[0] + Math.cos(repAngleOffset) * repR,
        ceoPos[1] + Math.sin(repAngleOffset) * repR,
        cz + 1 + ri * 0.3,
      ];

      nodes.push({
        id: `reporter-${ci}-${ri}`,
        label: rep,
        position: repPos,
        type: 'reporter',
        color: REPORTER_COLORS[rep] ?? '#ffffff',
      });

      edges.push({ from: ceoPos, to: repPos });
    });
  });

  return { nodes, edges };
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                            */
/* -------------------------------------------------------------------------- */

function GlowSphere({
  position,
  color,
  size,
  label,
}: {
  position: [number, number, number];
  color: string;
  size: number;
  label: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const s = 1 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.08;
    meshRef.current.scale.setScalar(s);
  });

  return (
    <group position={position}>
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[size * 1.6, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Core sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 24, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, -size - 0.35, 0]}
        fontSize={0.28}
        color="#cccccc"
        anchorX="center"
        anchorY="top"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {label}
      </Text>
    </group>
  );
}

function ConnectionLine({
  from,
  to,
}: {
  from: [number, number, number];
  to: [number, number, number];
}) {
  return (
    <Line
      points={[from, to]}
      color="#334155"
      lineWidth={1}
      transparent
      opacity={0.35}
    />
  );
}

function Pulse({
  from,
  to,
  speed,
  color,
  delay,
}: {
  from: [number, number, number];
  to: [number, number, number];
  speed: number;
  color: string;
  delay: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = ((state.clock.elapsedTime * speed + delay) % 1);
    meshRef.current.position.set(
      from[0] + (to[0] - from[0]) * t,
      from[1] + (to[1] - from[1]) * t,
      from[2] + (to[2] - from[2]) * t
    );
    // Fade at endpoints
    const fade = Math.sin(t * Math.PI);
    meshRef.current.scale.setScalar(fade * 0.8 + 0.2);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* -------------------------------------------------------------------------- */
/*  Scene                                                                     */
/* -------------------------------------------------------------------------- */

function Scene({ companies }: { companies: CompanyData[] }) {
  const groupRef = useRef<THREE.Group>(null);
  const { nodes, edges } = useMemo(() => buildGraph(companies), [companies]);

  // Create a set of animated pulses along edges
  const pulses = useMemo(() => {
    return edges.map((edge, i) => ({
      ...edge,
      speed: 0.15 + Math.random() * 0.2,
      color: i % 2 === 0 ? '#00f0ff' : '#8b5cf6',
      delay: Math.random() * 10,
    }));
  }, [edges]);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y =
      Math.sin(state.clock.elapsedTime * 0.05) * 0.15;
    groupRef.current.rotation.x =
      Math.cos(state.clock.elapsedTime * 0.03) * 0.05;
  });

  const sizeMap: Record<string, number> = {
    company: 0.45,
    ceo: 0.3,
    reporter: 0.18,
  };

  return (
    <group ref={groupRef}>
      {/* Connection lines */}
      {edges.map((edge, i) => (
        <ConnectionLine key={`edge-${i}`} from={edge.from} to={edge.to} />
      ))}

      {/* Animated pulses */}
      {pulses.map((pulse, i) => (
        <Pulse
          key={`pulse-${i}`}
          from={pulse.from}
          to={pulse.to}
          speed={pulse.speed}
          color={pulse.color}
          delay={pulse.delay}
        />
      ))}

      {/* Nodes */}
      {nodes.map((node) => (
        <GlowSphere
          key={node.id}
          position={node.position}
          color={node.color}
          size={sizeMap[node.type] ?? 0.2}
          label={node.label}
        />
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Ambient particles for background depth                                    */
/* -------------------------------------------------------------------------- */

function BackgroundDust() {
  const ref = useRef<THREE.Points>(null);
  const count = 500;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.008;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#334155"
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* -------------------------------------------------------------------------- */
/*  Exported component                                                        */
/* -------------------------------------------------------------------------- */

export function AgentFlowViz({ companies }: AgentFlowVizProps) {
  const data = companies && companies.length > 0 ? companies : DEMO_COMPANIES;

  return (
    <Canvas
      camera={{ position: [0, 0, 14], fov: 55 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.1} />
      <BackgroundDust />
      <Scene companies={data} />
    </Canvas>
  );
}
