"use client";

import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Icosahedron, Torus, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useTheme } from 'next-themes';

const useResolvedDarkMode = () => {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return true;
  return (resolvedTheme ?? theme ?? 'dark') !== 'light';
};

function SecurityCore({ isDark }: { isDark: boolean }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);

  const cyan = isDark ? '#22d3ee' : '#0ea5e9';
  const magenta = isDark ? '#d946ef' : '#a21caf';

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Core spin
    if (coreRef.current) coreRef.current.rotation.y = t * 0.2;

    // Wireframe forcefield spin
    if (wireframeRef.current) {
      wireframeRef.current.rotation.x = t * 0.15;
      wireframeRef.current.rotation.y = t * 0.2;
    }

    // Fast scanning rings
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.3) * 0.2;
      ring1Ref.current.rotation.y = t * 1.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = Math.PI / 3 + Math.cos(t * 0.4) * 0.3;
      ring2Ref.current.rotation.z = -t * 0.9;
    }
  });

  return (
    <group>
      {/* Central Solid Core */}
      <Sphere ref={coreRef} args={[1.2, 32, 32]}>
        <meshStandardMaterial
          color={isDark ? '#050a15' : '#e2e8f0'}
          emissive={cyan}
          emissiveIntensity={isDark ? 0.15 : 0.05}
          roughness={0.2}
          metalness={0.9}
        />
      </Sphere>

      {/* Wireframe Shield */}
      <Icosahedron ref={wireframeRef} args={[1.7, 2]}>
        <meshBasicMaterial
          color={cyan}
          wireframe
          transparent
          opacity={isDark ? 0.15 : 0.1}
        />
      </Icosahedron>

      {/* Security Scanning Ring 1 */}
      <Torus ref={ring1Ref} args={[2.2, 0.015, 16, 100]}>
        <meshBasicMaterial color={magenta} transparent opacity={isDark ? 0.8 : 0.5} />
      </Torus>

      {/* Security Scanning Ring 2 */}
      <Torus ref={ring2Ref} args={[2.6, 0.01, 16, 100]}>
        <meshBasicMaterial color={cyan} transparent opacity={isDark ? 0.5 : 0.3} />
      </Torus>

      {/* Tiny particles representing secure packets */}
      <Stars radius={6} depth={10} count={isDark ? 800 : 400} factor={2} saturation={1} fade speed={1.5} />
    </group>
  );
}

export function SecurityCanvas() {
  const isDark = useResolvedDarkMode();

  return (
    <div className="w-full h-[400px] lg:h-[500px]">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} gl={{ antialias: true, alpha: true }} dpr={[1, 2]}>
        <ambientLight intensity={isDark ? 0.3 : 1} />
        <pointLight position={[10, 10, 10]} intensity={isDark ? 1.5 : 0.8} color="#22d3ee" />
        <pointLight position={[-10, -10, -10]} intensity={isDark ? 1 : 0.5} color="#d946ef" />

        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
          <SecurityCore isDark={isDark} />
        </Float>

        <EffectComposer>
          <Bloom
            intensity={isDark ? 0.5 : 0.15}
            luminanceThreshold={isDark ? 0.2 : 0.8}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
