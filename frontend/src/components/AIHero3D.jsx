/**
 * AIHero3D.jsx
 * 3D rotating neural-network / AI brain using @react-three/fiber.
 * Reacts to mouse movement — rotates toward cursor.
 */
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

/* Floating nodes connected by lines — a neural network visual */
function NeuralNetwork({ count = 28 }) {
  const groupRef = useRef();
  const { mouse } = useThree();

  const nodes = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 2,
      ],
      speed: 0.003 + Math.random() * 0.004,
      offset: Math.random() * Math.PI * 2,
    }));
  }, [count]);

  // Edges between nearby nodes
  const edges = useMemo(() => {
    const result = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].position[0] - nodes[j].position[0];
        const dy = nodes[i].position[1] - nodes[j].position[1];
        const dz = nodes[i].position[2] - nodes[j].position[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 2.0) result.push([i, j, dist]);
      }
    }
    return result;
  }, [nodes]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    // Smooth rotation towards mouse
    groupRef.current.rotation.y += (mouse.x * 0.5 - groupRef.current.rotation.y) * 0.03;
    groupRef.current.rotation.x += (-mouse.y * 0.3 - groupRef.current.rotation.x) * 0.03;
    // Gentle auto-spin
    groupRef.current.rotation.y += 0.003;
  });

  return (
    <group ref={groupRef}>
      {/* Central glowing brain sphere */}
      <Sphere args={[0.55, 32, 32]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#4f46e5"
          attach="material"
          distort={0.35}
          speed={2}
          roughness={0}
          metalness={0.8}
          transparent
          opacity={0.85}
        />
      </Sphere>

      {/* Orbiting ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.85, 0.018, 8, 80]} />
        <meshBasicMaterial color="#0ea5e9" transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[1.1, 0.012, 8, 80]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.35} />
      </mesh>

      {/* Neural nodes */}
      {nodes.map((node, i) => (
        <mesh key={i} position={node.position}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshBasicMaterial
            color={i % 3 === 0 ? '#4f46e5' : i % 3 === 1 ? '#0ea5e9' : '#8b5cf6'}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}

      {/* Connection lines */}
      {edges.map(([i, j, dist], idx) => {
        const start = new THREE.Vector3(...nodes[i].position);
        const end   = new THREE.Vector3(...nodes[j].position);
        const mid   = start.clone().lerp(end, 0.5);
        const dir   = end.clone().sub(start);
        const len   = dir.length();
        dir.normalize();

        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

        return (
          <mesh key={idx} position={mid} quaternion={quaternion}>
            <cylinderGeometry args={[0.008, 0.008, len, 4]} />
            <meshBasicMaterial
              color="#4f46e5"
              transparent
              opacity={Math.max(0.05, 0.35 - dist * 0.12)}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function AIHero3D({ height = 500 }) {
  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={1.2} color="#4f46e5" />
        <pointLight position={[-5, -5, 3]} intensity={0.8} color="#0ea5e9" />
        <Stars radius={80} depth={40} count={600} factor={3} fade speed={0.5} />
        <NeuralNetwork count={28} />
      </Canvas>
      {/* Overlay gradient fade bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px',
        background: 'linear-gradient(to bottom, transparent, var(--bg-primary))',
        pointerEvents: 'none',
      }} />
    </div>
  );
}
