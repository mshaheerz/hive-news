'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Line } from '@react-three/drei';
import { useMemo, useRef } from 'react';
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

interface FigureProps {
  position: [number, number, number];
  color: string;
  label: string;
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
/*  Company Building                                                          */
/* -------------------------------------------------------------------------- */

function CompanyBuilding({ position, color, label }: FigureProps) {
  const groupRef = useRef<THREE.Group>(null);
  const screenGlowRef = useRef<THREE.Mesh>(null);
  const antennaTipRef = useRef<THREE.Mesh>(null);
  const offset = position[0] * 3 + position[1] * 7;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 1.5 + offset) * 0.03;
    }
    if (screenGlowRef.current) {
      (screenGlowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.4 + Math.sin(t * 2 + 1) * 0.25;
    }
    if (antennaTipRef.current) {
      (antennaTipRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.4 + Math.sin(t * 3 + offset) * 0.3;
    }
  });

  return (
    <group position={position}>
      <group ref={groupRef}>
        {/* Base slab */}
        <mesh position={[0, -0.45, 0]}>
          <boxGeometry args={[0.7, 0.1, 0.4]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>

        {/* Building body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.5, 0.6, 0.35]} />
          <meshBasicMaterial color={color} transparent opacity={0.85} />
        </mesh>

        {/* Screen face */}
        <mesh position={[0, 0.05, 0.19]}>
          <boxGeometry args={[0.3, 0.2, 0.02]} />
          <meshBasicMaterial color="#1e293b" transparent opacity={0.95} />
        </mesh>

        {/* Screen glow */}
        <mesh ref={screenGlowRef} position={[0, 0.05, 0.2]}>
          <boxGeometry args={[0.25, 0.15, 0.01]} />
          <meshBasicMaterial
            color="#00ff88"
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Roof ledge */}
        <mesh position={[0, 0.33, 0]}>
          <boxGeometry args={[0.55, 0.06, 0.4]} />
          <meshBasicMaterial color={color} transparent opacity={0.9} />
        </mesh>

        {/* Antenna pole */}
        <mesh position={[0, 0.55, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.35, 8]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>

        {/* Antenna tip glow */}
        <mesh ref={antennaTipRef} position={[0, 0.75, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.7}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Antenna outer glow */}
        <mesh position={[0, 0.75, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.1}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Windows row 1 */}
        {[-0.12, 0.12].map((x, i) => (
          <mesh key={`win1-${i}`} position={[x, -0.1, 0.19]}>
            <boxGeometry args={[0.08, 0.08, 0.01]} />
            <meshBasicMaterial
              color="#fbbf24"
              transparent
              opacity={0.5}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        ))}

        {/* Windows row 2 */}
        {[-0.12, 0.12].map((x, i) => (
          <mesh key={`win2-${i}`} position={[x, -0.25, 0.19]}>
            <boxGeometry args={[0.08, 0.08, 0.01]} />
            <meshBasicMaterial
              color="#fbbf24"
              transparent
              opacity={0.35}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        ))}

        {/* Label */}
        <Text
          position={[0, -0.65, 0]}
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
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  CEO Robot                                                                 */
/* -------------------------------------------------------------------------- */

function CEORobot({ position, color, label }: FigureProps) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const visorGlowRef = useRef<THREE.Mesh>(null);
  const offset = position[0] * 3 + position[1] * 7;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 1.2 + offset) * 0.04;
    }
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.8 + offset) * 0.15;
    }
    if (visorGlowRef.current) {
      (visorGlowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.5 + Math.sin(t * 2.5 + offset) * 0.3;
    }
  });

  return (
    <group position={position}>
      <group ref={groupRef}>
        {/* Feet */}
        <mesh position={[-0.08, -0.43, 0]}>
          <boxGeometry args={[0.1, 0.06, 0.12]} />
          <meshBasicMaterial color="#475569" />
        </mesh>
        <mesh position={[0.08, -0.43, 0]}>
          <boxGeometry args={[0.1, 0.06, 0.12]} />
          <meshBasicMaterial color="#475569" />
        </mesh>

        {/* Legs */}
        <mesh position={[-0.08, -0.33, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.15, 6]} />
          <meshBasicMaterial color="#64748b" />
        </mesh>
        <mesh position={[0.08, -0.33, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.15, 6]} />
          <meshBasicMaterial color="#64748b" />
        </mesh>

        {/* Body */}
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.2]} />
          <meshBasicMaterial color={color} transparent opacity={0.85} />
        </mesh>

        {/* Chest badge (gold star) */}
        <mesh position={[0, -0.05, 0.11]}>
          <boxGeometry args={[0.08, 0.08, 0.01]} />
          <meshBasicMaterial
            color="#fbbf24"
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Arms */}
        <mesh position={[-0.21, -0.08, 0]}>
          <boxGeometry args={[0.06, 0.22, 0.06]} />
          <meshBasicMaterial color="#64748b" />
        </mesh>
        <mesh position={[0.21, -0.08, 0]}>
          <boxGeometry args={[0.06, 0.22, 0.06]} />
          <meshBasicMaterial color="#64748b" />
        </mesh>

        {/* Right hand holding clipboard */}
        <mesh position={[0.21, -0.22, 0.05]}>
          <boxGeometry args={[0.1, 0.13, 0.02]} />
          <meshBasicMaterial color="#1e293b" transparent opacity={0.9} />
        </mesh>
        {/* Clipboard screen */}
        <mesh position={[0.21, -0.21, 0.065]}>
          <boxGeometry args={[0.07, 0.09, 0.005]} />
          <meshBasicMaterial
            color="#00ff88"
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 0.09, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.08, 6]} />
          <meshBasicMaterial color="#64748b" />
        </mesh>

        {/* Head group (rotates) */}
        <group ref={headRef} position={[0, 0.25, 0]}>
          {/* Head */}
          <mesh>
            <boxGeometry args={[0.25, 0.2, 0.2]} />
            <meshBasicMaterial color={color} transparent opacity={0.9} />
          </mesh>

          {/* Visor */}
          <mesh position={[0, 0.02, 0.11]}>
            <boxGeometry args={[0.18, 0.08, 0.01]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>

          {/* Visor glow */}
          <mesh ref={visorGlowRef} position={[0, 0.02, 0.115]}>
            <boxGeometry args={[0.15, 0.05, 0.005]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.6}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {/* Antennas */}
          <mesh position={[-0.08, 0.15, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.1, 6]} />
            <meshBasicMaterial color="#94a3b8" />
          </mesh>
          <mesh position={[0.08, 0.15, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.1, 6]} />
            <meshBasicMaterial color="#94a3b8" />
          </mesh>

          {/* Antenna tips */}
          <mesh position={[-0.08, 0.21, 0]}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.7}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0.08, 0.21, 0]}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.7}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>

        {/* Outer body glow */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.55, 12, 12]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.04}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Label */}
        <Text
          position={[0, -0.6, 0]}
          fontSize={0.25}
          color="#cccccc"
          anchorX="center"
          anchorY="top"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {label}
        </Text>
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Reporter Robot                                                            */
/* -------------------------------------------------------------------------- */

function ReporterRobot({ position, color, label }: FigureProps) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const micGlowRef = useRef<THREE.Mesh>(null);
  const lensGlowRef = useRef<THREE.Mesh>(null);
  const antennaTipRef = useRef<THREE.Mesh>(null);
  const offset = position[0] * 3 + position[1] * 7;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 1.8 + offset) * 0.03;
    }
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 1.0 + offset) * 0.2;
    }
    if (micGlowRef.current) {
      (micGlowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.4 + Math.sin(t * 3 + offset) * 0.3;
    }
    if (lensGlowRef.current) {
      (lensGlowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.4 + Math.sin(t * 3 + offset + 2) * 0.3;
    }
    if (antennaTipRef.current) {
      (antennaTipRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.4 + Math.sin(t * 4 + offset + 1) * 0.3;
    }
  });

  return (
    <group position={position}>
      <group ref={groupRef}>
        {/* Feet */}
        <mesh position={[-0.06, -0.35, 0]}>
          <boxGeometry args={[0.08, 0.04, 0.1]} />
          <meshBasicMaterial color="#475569" />
        </mesh>
        <mesh position={[0.06, -0.35, 0]}>
          <boxGeometry args={[0.08, 0.04, 0.1]} />
          <meshBasicMaterial color="#475569" />
        </mesh>

        {/* Legs */}
        <mesh position={[-0.06, -0.27, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.12, 6]} />
          <meshBasicMaterial color="#64748b" />
        </mesh>
        <mesh position={[0.06, -0.27, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.12, 6]} />
          <meshBasicMaterial color="#64748b" />
        </mesh>

        {/* Body */}
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[0.22, 0.22, 0.15]} />
          <meshBasicMaterial color={color} transparent opacity={0.85} />
        </mesh>

        {/* Press badge */}
        <mesh position={[0, -0.05, 0.08]}>
          <boxGeometry args={[0.1, 0.04, 0.01]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>

        {/* Left arm (microphone arm) */}
        <mesh position={[-0.15, -0.08, 0]}>
          <boxGeometry args={[0.05, 0.16, 0.05]} />
          <meshBasicMaterial color="#64748b" />
        </mesh>

        {/* Mic handle */}
        <group position={[-0.15, -0.22, 0.04]} rotation={[0.7, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.02, 0.02, 0.12, 6]} />
            <meshBasicMaterial color="#334155" />
          </mesh>
          {/* Mic head */}
          <mesh ref={micGlowRef} position={[0, -0.08, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.7}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          {/* Mic glow halo */}
          <mesh position={[0, -0.08, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.08}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>

        {/* Right arm (camera arm) */}
        <mesh position={[0.15, -0.06, 0]}>
          <boxGeometry args={[0.05, 0.16, 0.05]} />
          <meshBasicMaterial color="#64748b" />
        </mesh>

        {/* Camera body */}
        <mesh position={[0.2, -0.02, 0.08]}>
          <boxGeometry args={[0.1, 0.07, 0.07]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>

        {/* Camera lens barrel */}
        <mesh position={[0.2, -0.02, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.025, 0.05, 8]} />
          <meshBasicMaterial color="#64748b" />
        </mesh>

        {/* Lens glass glow */}
        <mesh ref={lensGlowRef} position={[0.2, -0.02, 0.17]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Camera record light */}
        <mesh position={[0.16, 0.02, 0.08]}>
          <sphereGeometry args={[0.012, 6, 6]} />
          <meshBasicMaterial
            color="#ef4444"
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.06, 6]} />
          <meshBasicMaterial color="#64748b" />
        </mesh>

        {/* Head group (rotates) */}
        <group ref={headRef} position={[0, 0.17, 0]}>
          {/* Head (sphere - distinct from CEO box head) */}
          <mesh>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshBasicMaterial color={color} transparent opacity={0.9} />
          </mesh>

          {/* Eye visor */}
          <mesh position={[0, 0.01, 0.12]}>
            <boxGeometry args={[0.14, 0.04, 0.01]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>

          {/* Eye glow */}
          <mesh position={[0, 0.01, 0.125]}>
            <boxGeometry args={[0.11, 0.025, 0.005]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.6}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {/* Antenna */}
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.08, 4]} />
            <meshBasicMaterial color="#94a3b8" />
          </mesh>

          {/* Antenna tip */}
          <mesh ref={antennaTipRef} position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.7}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>

        {/* Outer glow */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.45, 12, 12]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.04}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Label */}
        <Text
          position={[0, -0.5, 0]}
          fontSize={0.22}
          color="#cccccc"
          anchorX="center"
          anchorY="top"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {label}
        </Text>
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Connection & Pulse (unchanged)                                            */
/* -------------------------------------------------------------------------- */

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

  return (
    <group ref={groupRef}>
      {edges.map((edge, i) => (
        <ConnectionLine key={`edge-${i}`} from={edge.from} to={edge.to} />
      ))}

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

      {nodes.map((node) => {
        switch (node.type) {
          case 'company':
            return <CompanyBuilding key={node.id} position={node.position} color={node.color} label={node.label} />;
          case 'ceo':
            return <CEORobot key={node.id} position={node.position} color={node.color} label={node.label} />;
          case 'reporter':
            return <ReporterRobot key={node.id} position={node.position} color={node.color} label={node.label} />;
        }
      })}
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
