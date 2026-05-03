"use client";

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from 'next-themes';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';

// ─── Theme Hook ──────────────────────────────────────────────────────────
const useResolvedDarkMode = () => {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return true;
  const activeTheme = resolvedTheme ?? theme ?? 'dark';
  return activeTheme !== 'light';
};

// ─── Signal Pulse (animated particle traveling along a connection) ────────
const SignalPulse = ({
  start,
  end,
  color,
  speed = 0.45,
  delay = 0,
  isDark,
}: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  speed?: number;
  delay?: number;
  isDark: boolean;
}) => {
  const ref = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Mesh>(null);
  const progress = useRef(-delay);

  const curve = useMemo(() => {
    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    const mid = s.clone().add(e).multiplyScalar(0.5);
    mid.y += 0.28;
    return new THREE.QuadraticBezierCurve3(s, mid, e);
  }, [start, end]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    progress.current += delta * speed;
    if (progress.current > 1.2) progress.current = -(delay * 0.5 + Math.random() * delay);
    if (progress.current < 0) {
      ref.current.visible = false;
      if (trailRef.current) trailRef.current.visible = false;
      return;
    }
    const t = Math.min(1, progress.current);
    const pos = curve.getPoint(t);
    ref.current.visible = true;
    ref.current.position.copy(pos);
    const fade = Math.sin(t * Math.PI);
    (ref.current.material as THREE.MeshBasicMaterial).opacity = fade * (isDark ? 1.0 : 0.75);

    // trail slightly behind
    if (trailRef.current) {
      const tTrail = Math.max(0, Math.min(1, t - 0.05));
      const trailPos = curve.getPoint(tTrail);
      trailRef.current.visible = true;
      trailRef.current.position.copy(trailPos);
      (trailRef.current.material as THREE.MeshBasicMaterial).opacity = fade * (isDark ? 0.45 : 0.3);
    }
  });

  return (
    <group>
      <mesh ref={ref} visible={false}>
        <sphereGeometry args={[0.038, 10, 10]} />
        <meshBasicMaterial color={color} transparent opacity={0} />
      </mesh>
      <mesh ref={trailRef} visible={false}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0} />
      </mesh>
    </group>
  );
};

// ─── Neural Node ───────────────────────────────────────────────────────────
const NeuralNode = ({
  position,
  color,
  size = 0.08,
  active = false,
  isDark,
}: {
  position: [number, number, number];
  color: string;
  size?: number;
  active?: boolean;
  isDark: boolean;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const phase = useRef(Math.random() * Math.PI * 2);

  useFrame((s) => {
    if (!meshRef.current) return;
    const t = s.clock.elapsedTime;
    const pulse = 1 + Math.sin(t * 2.5 + phase.current) * (active ? 0.45 : 0.15);
    meshRef.current.scale.setScalar(pulse);

    if (ringRef.current) {
      const rp = 1 + Math.sin(t * 2.0 + phase.current + 0.5) * 0.3;
      ringRef.current.scale.setScalar(rp);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity =
        isDark
          ? 0.3 + Math.sin(t * 2.5 + phase.current) * 0.2
          : 0.18 + Math.sin(t * 2.5 + phase.current) * 0.1;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isDark ? (active ? 2.8 : 0.6) : (active ? 0.75 : 0.25)}
          transparent
          opacity={active ? 1 : isDark ? 0.88 : 0.82}
          roughness={isDark ? 0 : 0.18}
          metalness={isDark ? 0.65 : 0.2}
        />
      </mesh>
      {/* Halo ring on active nodes */}
      {active && (
        <mesh ref={ringRef} position={position} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[size * 2.0, 0.007, 8, 40]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
};

// ─── Connection Line ──────────────────────────────────────────────────────
const ConnectionLine = ({
  start,
  end,
  color,
  opacity = 0.25,
  isDark,
}: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  opacity?: number;
  isDark: boolean;
}) => {
  const lineRef = useRef<THREE.Line>(null);
  const phaseOffset = useRef(Math.random() * Math.PI * 2);

  const points = useMemo(() => {
    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    const mid = s.clone().add(e).multiplyScalar(0.5);
    mid.y += 0.3;
    return new THREE.QuadraticBezierCurve3(s, mid, e).getPoints(24);
  }, [start, end]);

  const geometry = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(points),
    [points]
  );

  useFrame((s) => {
    if (!lineRef.current) return;
    const mat = lineRef.current.material as THREE.LineBasicMaterial;
    mat.opacity =
      opacity * (0.45 + 0.55 * Math.sin(s.clock.elapsedTime * 1.3 + phaseOffset.current));
  });

  return (
    // @ts-ignore
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
        depthWrite={false}
      />
    </line>
  );
};

// ─── DNA Helix Core ───────────────────────────────────────────────────────
const HelixCore = ({ isDark }: { isDark: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const colorA = isDark ? '#22d3ee' : '#0891b2';
  const colorB = isDark ? '#e879f9' : '#a21caf';
  const crossColor = isDark ? '#ffffff' : '#6366f1';

  const { strandA, strandB, crossGeos } = useMemo(() => {
    const sA: [number, number, number][] = [];
    const sB: [number, number, number][] = [];
    const cGeos: THREE.BufferGeometry[] = [];
    const count = 20;
    for (let i = 0; i < count; i++) {
      const t = (i / (count - 1)) * Math.PI * 4 - Math.PI * 2;
      const r = 0.19;
      const ax = r * Math.cos(t);
      const ay = t * 0.1;
      const az = r * Math.sin(t);
      const bx = r * Math.cos(t + Math.PI);
      const bz = r * Math.sin(t + Math.PI);
      sA.push([ax, ay, az]);
      sB.push([bx, ay, bz]);
      if (i % 3 === 0) {
        cGeos.push(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(ax, ay, az),
            new THREE.Vector3(bx, ay, bz),
          ])
        );
      }
    }
    return { strandA: sA, strandB: sB, crossGeos: cGeos };
  }, []);

  useFrame((s) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = s.clock.elapsedTime * 0.65;
  });

  return (
    <group ref={groupRef}>
      {strandA.map((pos, i) => (
        <mesh key={`sa${i}`} position={pos}>
          <sphereGeometry args={[0.024, 8, 8]} />
          <meshStandardMaterial
            color={colorA} emissive={colorA}
            emissiveIntensity={isDark ? 4.5 : 1.2}
          />
        </mesh>
      ))}
      {strandB.map((pos, i) => (
        <mesh key={`sb${i}`} position={pos}>
          <sphereGeometry args={[0.024, 8, 8]} />
          <meshStandardMaterial
            color={colorB} emissive={colorB}
            emissiveIntensity={isDark ? 4.5 : 1.2}
          />
        </mesh>
      ))}
      {crossGeos.map((geo, i) => (
        // @ts-ignore
        <line key={`sc${i}`} geometry={geo}>
          <lineBasicMaterial
            color={crossColor} transparent
            opacity={isDark ? 0.55 : 0.3}
          />
        </line>
      ))}
    </group>
  );
};

// ─── Orbital Particle Ring ────────────────────────────────────────────────
const OrbitalRing = ({
  radius,
  tiltX,
  tiltZ,
  speed,
  color,
  count = 220,
  isDark,
}: {
  radius: number;
  tiltX: number;
  tiltZ: number;
  speed: number;
  color: string;
  count?: number;
  isDark: boolean;
}) => {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = radius + (Math.random() - 0.5) * 0.14;
      const spread = (Math.random() - 0.5) * 0.07;
      pos[i * 3]     = r * Math.cos(angle);
      pos[i * 3 + 1] = spread;
      pos[i * 3 + 2] = r * Math.sin(angle);
    }
    return pos;
  }, [radius, count]);

  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.y = s.clock.elapsedTime * speed;
    ref.current.rotation.x = tiltX;
    ref.current.rotation.z = tiltZ;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={isDark ? 0.042 : 0.03}
        sizeAttenuation
        depthWrite={false}
        blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
        opacity={isDark ? 0.7 : 0.55}
      />
    </Points>
  );
};

// ─── Ambient Particle Cloud ───────────────────────────────────────────────
const ParticleCloud = ({ isDark }: { isDark: boolean }) => {
  const ref = useRef<THREE.Points>(null);
  const color = isDark ? '#818cf8' : '#6366f1';

  const positions = useMemo(() => {
    const count = 700;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.random(), v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = 3.6 + Math.random() * 1.6;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime;
    ref.current.rotation.y = t * 0.018;
    ref.current.rotation.x = t * 0.012;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent color={color}
        size={isDark ? 0.022 : 0.016}
        sizeAttenuation depthWrite={false}
        blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
        opacity={isDark ? 0.32 : 0.22}
      />
    </Points>
  );
};

// ─── Atmospheric Shell ────────────────────────────────────────────────────
const AtmosphericShell = ({ isDark }: { isDark: boolean }) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((s) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.opacity = isDark
      ? 0.045 + Math.sin(s.clock.elapsedTime * 0.45) * 0.012
      : 0.09  + Math.sin(s.clock.elapsedTime * 0.45) * 0.02;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[4.0, 64, 64]} />
      <meshStandardMaterial
        color={isDark ? '#4f46e5' : '#312e81'}
        emissive={isDark ? '#4338ca' : '#1e1b4b'}
        emissiveIntensity={isDark ? 0.6 : 0.25}
        transparent opacity={0.05}
        side={THREE.BackSide} depthWrite={false}
      />
    </mesh>
  );
};

// ─── Neural Lattice ───────────────────────────────────────────────────────
const NeuralLattice = ({ isDark }: { isDark: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);

  const VIOLET  = isDark ? '#a855f7' : '#7e22ce';
  const INDIGO  = isDark ? '#818cf8' : '#4f46e5';
  const CYAN    = isDark ? '#22d3ee' : '#0891b2';
  const AMBER   = isDark ? '#facc15' : '#ca8a04';
  const MAGENTA = isDark ? '#f472b6' : '#db2777';
  const ROSE    = isDark ? '#fb7185' : '#e11d48';

  const nodes = useMemo(() => {
    const result: {
      pos: [number, number, number];
      color: string;
      active: boolean;
      size: number;
    }[] = [];
    const palette = [VIOLET, INDIGO, CYAN, MAGENTA, INDIGO, ROSE];
    const golden = (1 + Math.sqrt(5)) / 2;
    const total = 34;
    for (let i = 0; i < total; i++) {
      const theta = (2 * Math.PI * i) / golden;
      const phi   = Math.acos(1 - (2 * (i + 0.5)) / total);
      const r     = 2.0 + (Math.random() - 0.5) * 0.45;
      const active = Math.random() < 0.22;
      result.push({
        pos: [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi),
        ],
        color: active ? AMBER : palette[i % palette.length],
        active,
        size: active ? 0.14 : 0.065 + Math.random() * 0.05,
      });
    }
    return result;
  }, []);

  const connections = useMemo(() => {
    const result: {
      start: [number, number, number];
      end:   [number, number, number];
      color: string;
      isActive: boolean;
    }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].pos[0] - nodes[j].pos[0];
        const dy = nodes[i].pos[1] - nodes[j].pos[1];
        const dz = nodes[i].pos[2] - nodes[j].pos[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 1.9) {
          const isActive = nodes[i].active || nodes[j].active;
          result.push({
            start: nodes[i].pos,
            end:   nodes[j].pos,
            color: isActive ? AMBER : INDIGO,
            isActive,
          });
        }
      }
    }
    return result;
  }, [nodes]);

  // Connections that carry animated signal pulses
  const pulseConnections = useMemo(
    () =>
      connections
        .filter((c) => c.isActive || Math.random() < 0.28)
        .slice(0, 22),
    [connections]
  );

  useFrame((s) => {
    if (!groupRef.current) return;
    const t = s.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.07;
    groupRef.current.rotation.x = Math.sin(t * 0.045) * 0.18;
  });

  return (
    <group ref={groupRef}>
      {/* Outer wireframe lattice sphere */}
      <Sphere args={[2.35, 32, 32]}>
        <meshBasicMaterial
          color={isDark ? VIOLET : '#4338ca'}
          wireframe transparent
          opacity={isDark ? 0.055 : 0.16}
        />
      </Sphere>

      {/* Inner glow shell */}
      <Sphere args={[0.72, 32, 32]}>
        <meshStandardMaterial
          color={isDark ? CYAN : '#312e81'}
          emissive={isDark ? CYAN : '#312e81'}
          emissiveIntensity={isDark ? 0.9 : 0.2}
          transparent opacity={isDark ? 0.08 : 0.06}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Central glow orb */}
      <Sphere args={[0.48, 32, 32]}>
        <meshStandardMaterial
          color={isDark ? '#22d3ee' : '#312e81'}
          emissive={isDark ? '#22d3ee' : '#312e81'}
          emissiveIntensity={isDark ? 5 : 0.35}
          transparent opacity={isDark ? 0.38 : 0.28}
        />
      </Sphere>

      {/* DNA Helix Core */}
      <HelixCore isDark={isDark} />

      {/* 3 Spinning halo rings at different angles */}
      {([
        [0.68, CYAN,    [Math.PI / 2,         0, 0]],
        [0.85, MAGENTA, [Math.PI / 2 + 0.9,   0, 0.6]],
        [1.0,  VIOLET,  [Math.PI / 2 - 0.6,   0, -0.9]],
      ] as [number, string, [number, number, number]][]).map(([r, col, rot], i) => {
        const ringRef = useRef<THREE.Mesh>(null);
        useFrame((s) => {
          if (!ringRef.current) return;
          ringRef.current.rotation.z = s.clock.elapsedTime * [0.4, -0.28, 0.55][i];
        });
        return (
          <mesh key={i} ref={ringRef} rotation={rot as [number, number, number]}>
            <torusGeometry args={[r, 0.007, 16, 100]} />
            <meshStandardMaterial
              color={col} emissive={col}
              emissiveIntensity={isDark ? 2.2 : 0.65}
              transparent opacity={isDark ? 0.55 : 0.38}
            />
          </mesh>
        );
      })}

      {/* Connection lines */}
      {connections.slice(0, 48).map((c, i) => (
        <ConnectionLine
          key={i}
          start={c.start} end={c.end} color={c.color}
          isDark={isDark}
          opacity={c.isActive ? (isDark ? 0.6 : 0.4) : (isDark ? 0.17 : 0.11)}
        />
      ))}

      {/* Nodes */}
      {nodes.map((n, i) => (
        <NeuralNode
          key={i}
          position={n.pos} color={n.color}
          size={n.size} active={n.active}
          isDark={isDark}
        />
      ))}

      {/* Animated signal pulses traveling along connections */}
      {pulseConnections.map((c, i) => (
        <SignalPulse
          key={i}
          start={c.start} end={c.end}
          color={c.isActive ? AMBER : CYAN}
          speed={0.28 + Math.random() * 0.38}
          delay={Math.random() * 2.5}
          isDark={isDark}
        />
      ))}
    </group>
  );
};

// ─── Camera Drift ─────────────────────────────────────────────────────────
const CameraDrift = () => {
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    s.camera.position.x = Math.sin(t * 0.07)  * 0.65;
    s.camera.position.y = Math.cos(t * 0.055) * 0.38 + 0.5;
    s.camera.lookAt(0, 0, 0);
  });
  return null;
};

// ─── Main Export ──────────────────────────────────────────────────────────
export function HeroCanvas() {
  const isDark = useResolvedDarkMode();

  return (
    <Canvas
      camera={{ position: [0, 0.5, 6.5], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ background: 'transparent' }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(0x000000, 0);
        gl.setClearAlpha(0);
        scene.background = null;
      }}
    >
      {/* Lighting */}
      <ambientLight intensity={isDark ? 0.35 : 0.9} />
      <pointLight position={[ 5,  5,  5]} intensity={isDark ? 1.8 : 1.1}  color={isDark ? '#d946ef' : '#a21caf'} />
      <pointLight position={[-5, -3, -5]} intensity={isDark ? 1.4 : 0.9}  color={isDark ? '#22d3ee' : '#0891b2'} />
      <pointLight position={[ 0, -5,  3]} intensity={isDark ? 1.0 : 0.7}  color={isDark ? '#a3e635' : '#65a30d'} />
      <pointLight position={[ 3,  3, -5]} intensity={isDark ? 0.85 : 0.55} color={isDark ? '#fb7185' : '#e11d48'} />

      {/* Outer atmospheric glow shell */}
      <AtmosphericShell isDark={isDark} />

      {/* Main neural lattice with DNA core + pulses */}
      <Float floatIntensity={0.4} rotationIntensity={0} speed={1.5}>
        <NeuralLattice isDark={isDark} />
      </Float>

      {/* Three independent orbital particle rings */}
      <OrbitalRing
        radius={2.85} tiltX={0.42}  tiltZ={0}
        speed={0.24}  color={isDark ? '#22d3ee' : '#0ea5e9'}
        isDark={isDark}
      />
      <OrbitalRing
        radius={3.15} tiltX={-0.58} tiltZ={0.3}
        speed={-0.17} color={isDark ? '#a855f7' : '#7c3aed'}
        count={160}   isDark={isDark}
      />
      <OrbitalRing
        radius={2.55} tiltX={1.25}  tiltZ={-0.2}
        speed={0.33}  color={isDark ? '#f472b6' : '#db2777'}
        count={110}   isDark={isDark}
      />

      {/* Ambient dust particles */}
      <ParticleCloud isDark={isDark} />

      <CameraDrift />

      <EffectComposer>
        <Bloom
          intensity={isDark ? 0.6 : 0.2}
          luminanceThreshold={isDark ? 0.7 : 0.9}
          luminanceSmoothing={0.88}
        />
        {/* Subtle chromatic aberration in dark mode for a sci-fi lens feel */}
        {isDark ? (
          <ChromaticAberration
            offset={new THREE.Vector2(0.0007, 0.0007) as any}
          />
        ) : (
          <></>
        )}
      </EffectComposer>
    </Canvas>
  );
}