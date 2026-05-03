"use client";

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Float, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useTheme } from 'next-themes';

// ─── Data Center Coordinates (Expanded GCP & AWS) ───────────────────────────
const DATA_CENTERS = [
  // GCP (Google Cloud Platform) - Blue/Green hues
  { name: 'GCP Iowa', lat: 41.2, lon: -95.8, color: '#4285F4', provider: 'gcp' },
  { name: 'GCP Oregon', lat: 45.8, lon: -119.7, color: '#34A853', provider: 'gcp' },
  { name: 'GCP Belgium', lat: 50.4, lon: 3.8, color: '#4285F4', provider: 'gcp' },
  { name: 'GCP Taiwan', lat: 24.0, lon: 120.4, color: '#34A853', provider: 'gcp' },
  { name: 'GCP Singapore', lat: 1.3, lon: 103.8, color: '#4285F4', provider: 'gcp' },
  { name: 'GCP London', lat: 51.5, lon: -0.1, color: '#34A853', provider: 'gcp' },
  { name: 'GCP Sydney', lat: -33.8, lon: 151.2, color: '#4285F4', provider: 'gcp' },

  // AWS (Amazon Web Services) - Orange/Gold hues
  { name: 'AWS Virginia', lat: 38.9, lon: -77.4, color: '#FF9900', provider: 'aws' },
  { name: 'AWS Tokyo', lat: 35.6, lon: 139.6, color: '#FF9900', provider: 'aws' },
  { name: 'AWS Frankfurt', lat: 50.1, lon: 8.6, color: '#FF9900', provider: 'aws' },
  { name: 'AWS Mumbai', lat: 19.0, lon: 72.8, color: '#FF9900', provider: 'aws' },
  { name: 'AWS Sydney', lat: -33.8, lon: 151.2, color: '#FF9900', provider: 'aws' },
  { name: 'AWS São Paulo', lat: -23.5, lon: -46.6, color: '#FF9900', provider: 'aws' },

  // Azure (Microsoft) - Azure Blue/Indigo hues
  { name: 'Azure East US', lat: 37.37, lon: -79.81, color: '#0078D4', provider: 'azure' },
  { name: 'Azure North Europe', lat: 53.34, lon: -6.25, color: '#5C2D91', provider: 'azure' },
  { name: 'Azure Japan East', lat: 35.68, lon: 139.77, color: '#0078D4', provider: 'azure' },
  { name: 'Azure Southeast Asia', lat: 1.28, lon: 103.83, color: '#5C2D91', provider: 'azure' },
  { name: 'Azure Australia East', lat: -33.86, lon: 151.2, color: '#0078D4', provider: 'azure' },
  { name: 'Azure Central India', lat: 18.58, lon: 73.91, color: '#5C2D91', provider: 'azure' },
];

function latLongToVector3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// ─── Pulsing Ring Marker ──────────────────────────────────────────────────
const PulsingMarker = ({ position, color, isDark }: { position: THREE.Vector3; color: string; isDark: boolean }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const lookAtPos = useRef(new THREE.Vector3());

  useFrame((s) => {
    if (!ringRef.current) return;
    const pulse = 1 + Math.sin(s.clock.elapsedTime * 2) * 0.1; // Slower, smaller pulse
    ringRef.current.scale.set(pulse, pulse, pulse);
    const mat = ringRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = (0.2 + 0.1 * Math.sin(s.clock.elapsedTime * 2)) * (isDark ? 0.6 : 0.45);
  });

  return (
    <group position={position} onUpdate={(self) => self.lookAt(lookAtPos.current)}>
      {/* Core Point */}
      <mesh>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Outer Pulsing Ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.04, 0.05, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* Glow Point Light */}
      <pointLight color={color} intensity={isDark ? 0.4 : 0.18} distance={0.8} />
    </group>
  );
};

// ─── Arc Between Two Points ───────────────────────────────────────────────
const ConnectionArc = ({ start, end, color, isDark }: { start: THREE.Vector3; end: THREE.Vector3; color: string; isDark: boolean }) => {
  const lineRef = useRef<THREE.Line>(null);

  const points = useMemo(() => {
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const distance = start.distanceTo(end);
    mid.normalize().multiplyScalar(2.0 + distance * 0.4);
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return curve.getPoints(50);
  }, [start, end]);

  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  useFrame((s) => {
    if (!lineRef.current) return;
    const mat = lineRef.current.material as THREE.LineBasicMaterial;
    mat.opacity = (0.2 + 0.3 * Math.sin(s.clock.elapsedTime * 2 + Math.random())) * 0.8;
  });

  return (
    // @ts-ignore
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={isDark ? 0.4 : 0.32} blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending} />
    </line>
  );
};

// ─── Globe Component ──────────────────────────────────────────────────────
const Globe = ({ isDark }: { isDark: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const radius = 2.0;

  // Colors based on theme
  const sphereColor = isDark ? '#050a15' : '#cbd5e1';
  const mapDotColor = isDark ? '#22d3ee' : '#0ea5e9';
  const glowColor = isDark ? '#22d3ee' : '#0284c7';

  const providerColorMap = {
    gcp: isDark ? '#22d3ee' : '#0891b2',
    aws: isDark ? '#facc15' : '#ca8a04',
    azure: isDark ? '#a78bfa' : '#7e22ce',
  } as const;

  const points = useMemo(() => {
    return DATA_CENTERS.map(dc => ({
      pos: latLongToVector3(dc.lat, dc.lon, radius),
      color: providerColorMap[dc.provider as keyof typeof providerColorMap] ?? dc.color
    }));
  }, [isDark]);

  const connections = useMemo(() => {
    const res: { start: THREE.Vector3; end: THREE.Vector3; color: string }[] = [];
    for (let i = 0; i < points.length; i++) {
      // Only connect some points for visual clarity
      if (i % 3 === 0) {
        const targets = [(i + 1) % points.length, (i + 4) % points.length];
        targets.forEach(tIdx => {
          res.push({ start: points[i].pos, end: points[tIdx].pos, color: points[i].color });
        });
      }
    }
    return res;
  }, [points]);

  // Procedural map dots (mapped to continents)
  const mapDots = useMemo(() => {
    // Create a small off-screen canvas to draw a simplified world map
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new Float32Array(0);

    // Fill water (black)
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 120, 60);

    // Draw simplified continents (white)
    ctx.fillStyle = '#fff';

    // Americas
    ctx.beginPath();
    ctx.moveTo(15, 5); ctx.lineTo(35, 10); ctx.lineTo(38, 35); ctx.lineTo(25, 55); ctx.lineTo(15, 30); ctx.closePath();
    ctx.fill();

    // Eurasia + Africa
    ctx.beginPath();
    ctx.moveTo(55, 10); ctx.lineTo(105, 5); ctx.lineTo(110, 35); ctx.lineTo(90, 45); ctx.lineTo(60, 45); ctx.lineTo(50, 25); ctx.closePath();
    ctx.fill();

    // Australia
    ctx.beginPath();
    ctx.moveTo(95, 40); ctx.lineTo(105, 40); ctx.lineTo(105, 48); ctx.lineTo(95, 48); ctx.closePath();
    ctx.fill();

    const imgData = ctx.getImageData(0, 0, 120, 60).data;

    const count = 6000;
    const tempPos = [];
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;

      // Convert to UV
      const u = ((theta % (Math.PI * 2)) / (Math.PI * 2));
      const v = phi / Math.PI;

      const xIdx = Math.floor(u * 120);
      const yIdx = Math.floor(v * 60);
      const pixelIdx = (yIdx * 120 + xIdx) * 4;

      if (imgData[pixelIdx] > 128) {
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        tempPos.push(x, y, z);
      }
    }
    return new Float32Array(tempPos);
  }, []);

  useFrame((s) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = s.clock.elapsedTime * 0.1;
  });

  return (
    <group ref={groupRef}>
      {/* The Earth Sphere */}
      <Sphere args={[radius, 64, 64]}>
        <meshStandardMaterial
          color={sphereColor}
          emissive={glowColor}
          emissiveIntensity={isDark ? 0.06 : 0.05}
          roughness={0.5}
          metalness={0.8}
        />
      </Sphere>

      {/* Map Dots Overlay (Representing "Exact Globe Map") */}
      <Points positions={mapDots} stride={3}>
        <PointMaterial
          transparent
          color={mapDotColor}
          size={isDark ? 0.03 : 0.035}
          sizeAttenuation
          depthWrite={false}
          opacity={isDark ? 0.34 : 0.58}
        />
      </Points>

      {/* Atmosphere Glow (Minimalist) */}
      <Sphere args={[radius * 1.05, 64, 64]}>
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={isDark ? 0.04 : 0.035}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Connection Arcs */}
      {connections.map((c, i) => (
        <ConnectionArc key={i} start={c.start} end={c.end} color={c.color} isDark={isDark} />
      ))}

      {/* Data Center Points with Pulsing Rings */}
      {points.map((p, i) => (
        <PulsingMarker key={i} position={p.pos} color={p.color} isDark={isDark} />
      ))}
    </group>
  );
};

const useResolvedDarkMode = () => {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return true;
  const activeTheme = resolvedTheme ?? theme ?? 'dark';
  return activeTheme !== 'light';
};

// ─── Main Export ──────────────────────────────────────────────────────────
export function GlobeCanvas() {
  const isDark = useResolvedDarkMode();

  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={isDark ? 0.24 : 0.72} />
        <pointLight position={[10, 10, 10]} intensity={isDark ? 1 : 0.75} color={isDark ? '#22d3ee' : '#0ea5e9'} />

        <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.3}>
          <Globe isDark={isDark} />
        </Float>

        <EffectComposer>
          <Bloom
            intensity={isDark ? 0.24 : 0.12}
            luminanceThreshold={isDark ? 0.28 : 0.9}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
