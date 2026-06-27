import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Particles({ count = 2000 }) {
  const ref = useRef();
  const { pointer } = useThree();
  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    const palette = [new THREE.Color('#00e5ff'), new THREE.Color('#3b82f6'), new THREE.Color('#6ee7ff')];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
      siz[i] = Math.random() * 3 + 1;
    }
    return [pos, col, siz];
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * 0.15;
    const positions = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const x0 = positions[i * 3 + 0] + Math.sin(t + i * 0.01) * 0.002;
      const y0 = positions[i * 3 + 1] + Math.cos(t + i * 0.01) * 0.002;
      positions[idx] += (x0 - positions[idx]) * 0.01;
      positions[i * 3 + 1] += Math.sin(t + i * 0.005) * 0.001;
      positions[i * 3 + 2] += Math.cos(t + i * 0.003) * 0.001;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    const rx = (pointer.y * Math.PI) / 8;
    const ry = (pointer.x * Math.PI) / 8;
    ref.current.rotation.x += (rx - ref.current.rotation.x) * 0.02;
    ref.current.rotation.y += (ry - ref.current.rotation.y) * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function FloatingObject({ position, geometry, color, speed = 0.5, scale = 1 }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x += 0.005 * speed;
    ref.current.rotation.y += 0.01 * speed;
    ref.current.position.y += Math.sin(state.clock.elapsedTime * speed + position[0]) * 0.002;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={ref} position={position} scale={scale}>
        {geometry}
        <MeshDistortMaterial
          color={color}
          transparent
          opacity={0.3}
          roughness={0.2}
          metalness={0.8}
          envMapIntensity={1}
          wireframe
        />
      </mesh>
    </Float>
  );
}

function KnowledgeObjects() {
  const objects = useMemo(() => [
    { pos: [-5, 2, -3], color: '#00e5ff', scale: 0.8, speed: 0.7, geo: <torusKnotGeometry args={[1, 0.3, 64, 8]} /> },
    { pos: [6, -1, -4], color: '#3b82f6', scale: 0.6, speed: 0.5, geo: <icosahedronGeometry args={[1, 0]} /> },
    { pos: [-4, -2, -6], color: '#6ee7ff', scale: 0.5, speed: 0.9, geo: <torusGeometry args={[0.8, 0.3, 16, 32]} /> },
    { pos: [5, 3, -5], color: '#00e5ff', scale: 0.7, speed: 0.6, geo: <octahedronGeometry args={[1]} /> },
    { pos: [0, -3, -8], color: '#3b82f6', scale: 0.9, speed: 0.4, geo: <dodecahedronGeometry args={[1]} /> },
    { pos: [-7, 0, -2], color: '#6ee7ff', scale: 0.4, speed: 1.0, geo: <boxGeometry args={[1.2, 1.2, 1.2]} /> },
    { pos: [8, 1, -3], color: '#00e5ff', scale: 0.6, speed: 0.8, geo: <ringGeometry args={[0.3, 0.8, 32]} /> },
    { pos: [-2, 4, -7], color: '#3b82f6', scale: 0.5, speed: 0.5, geo: <coneGeometry args={[0.8, 1.2, 16]} /> },
    { pos: [3, -2, -10], color: '#6ee7ff', scale: 0.7, speed: 0.6, geo: <torusKnotGeometry args={[0.6, 0.2, 48, 6]} /> },
    { pos: [-8, -1, -5], color: '#00e5ff', scale: 0.45, speed: 0.7, geo: <icosahedronGeometry args={[0.8, 0]} /> },
  ], []);

  return objects.map((o, i) => (
    <FloatingObject key={i} {...o} geometry={o.geo} />
  ));
}

function GlowingLights() {
  const lights = useMemo(() => [
    { pos: [-8, 4, -5], color: '#00e5ff', intensity: 0.5 },
    { pos: [8, 3, -4], color: '#3b82f6', intensity: 0.4 },
    { pos: [0, -4, -8], color: '#6ee7ff', intensity: 0.3 },
    { pos: [-5, -2, 2], color: '#00e5ff', intensity: 0.35 },
    { pos: [7, -3, -6], color: '#3b82f6', intensity: 0.25 },
  ], []);

  return lights.map((l, i) => (
    <pointLight key={i} position={l.pos} color={l.color} intensity={l.intensity} distance={15} decay={2} />
  ));
}

function Scene({ scrollY }) {
  const groupRef = useRef();
  const { pointer } = useThree();

  useFrame(() => {
    if (!groupRef.current) return;
    const rx = (pointer.y * Math.PI) / 12;
    const ry = (pointer.x * Math.PI) / 12;
    groupRef.current.rotation.x += (rx - groupRef.current.rotation.x) * 0.02;
    groupRef.current.rotation.y += (ry - groupRef.current.rotation.y) * 0.02;
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[0, 5, 5]} intensity={0.3} color="#00e5ff" />
      <group ref={groupRef}>
        <Particles count={2500} />
        <KnowledgeObjects />
        <GlowingLights />
      </group>
      <fog attach="fog" args={['#0a0a0a', 10, 30]} />
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00e5ff] border-t-transparent" />
    </div>
  );
}

export default function HeroScene({ scrollY = 0 }) {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: '#0a0a0a' }}
        fallback={<LoadingFallback />}
      >
        <Scene scrollY={scrollY} />
      </Canvas>
    </div>
  );
}
