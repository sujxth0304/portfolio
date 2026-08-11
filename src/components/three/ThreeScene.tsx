"use client";

import { useRef, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Float, MeshDistortMaterial, AdaptiveDpr } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

/* ============================================================
   CAMERA RIG — mouse parallax
   ============================================================ */

function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 0.9;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 0.6;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame(() => {
    // Smooth lerp toward mouse
    target.current.x += (mouse.current.x - target.current.x) * 0.04;
    target.current.y += (mouse.current.y - target.current.y) * 0.04;
    camera.position.x = target.current.x;
    camera.position.y = target.current.y;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ============================================================
   ARCHITECT ORB — central icosahedron
   ============================================================ */

function ArchitectOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.12;
      meshRef.current.rotation.x = Math.sin(t * 0.18) * 0.07;
    }
    if (glowRef.current) {
      const s = 1 + Math.sin(t * 0.9) * 0.04;
      glowRef.current.scale.set(s, s, s);
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.12} floatIntensity={0.28}>
      <group>
        {/* Outer glow aura */}
        <mesh ref={glowRef}>
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshBasicMaterial
            color="#DC0000"
            transparent
            opacity={0.04}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Main distorted surface */}
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[1, 4]} />
          <MeshDistortMaterial
            color="#CC0000"
            distort={0.22}
            speed={2.2}
            roughness={0.04}
            metalness={0.95}
            emissive="#770000"
            emissiveIntensity={0.6}
          />
        </mesh>

        {/* Cyan wireframe overlay */}
        <mesh>
          <icosahedronGeometry args={[1.035, 4]} />
          <meshBasicMaterial
            color="#00D4FF"
            wireframe
            transparent
            opacity={0.07}
          />
        </mesh>

        {/* Inner glass sphere */}
        <mesh>
          <sphereGeometry args={[0.78, 24, 24]} />
          <meshBasicMaterial
            color="#FF2200"
            transparent
            opacity={0.10}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Light source inside */}
        <pointLight
          color="#DC0000"
          intensity={8}
          distance={9}
          decay={2}
        />
      </group>
    </Float>
  );
}

/* ============================================================
   ORBITAL RING — line-based circle with marker
   ============================================================ */

interface RingProps {
  radius: number;
  color: string;
  rotation: [number, number, number];
  speed: number;
  opacity?: number;
}

function OrbRing({
  radius,
  color,
  rotation,
  speed,
  opacity = 0.32,
}: RingProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Build closed circle as a THREE.Line primitive (avoids SVG <line> JSX conflict)
  const lineObject = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 160;
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    return new THREE.Line(geo, mat);
  }, [radius, color, opacity]);

  useEffect(() => () => {
    lineObject.geometry.dispose();
    (lineObject.material as THREE.LineBasicMaterial).dispose();
  }, [lineObject]);

  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.z += dt * speed;
  });

  return (
    <group rotation={rotation}>
      <group ref={groupRef}>
        <primitive object={lineObject} />

        {/* Traveling marker dot */}
        <mesh position={[radius, 0, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>

        {/* Secondary marker */}
        <mesh position={[-radius * 0.6, radius * 0.8, 0]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} />
        </mesh>
      </group>
    </group>
  );
}

/* ============================================================
   BACKGROUND SHAPE — barely-visible wireframe geometry
   ============================================================ */

interface BgShapeProps {
  position: [number, number, number];
  initialRotation: [number, number, number];
  color: string;
  size?: number;
  speed?: number;
}

function BackgroundShape({
  position,
  initialRotation,
  color,
  size = 0.7,
  speed = 1,
}: BgShapeProps) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed;
    ref.current.rotation.x = initialRotation[0] + t * 0.04;
    ref.current.rotation.y = initialRotation[1] + t * 0.07;
    ref.current.rotation.z = initialRotation[2] + t * 0.03;
  });

  return (
    <mesh ref={ref} position={position}>
      <octahedronGeometry args={[size, 0]} />
      <meshBasicMaterial
        color={color}
        wireframe
        transparent
        opacity={0.035}
      />
    </mesh>
  );
}

/* ============================================================
   AMBIENT PARTICLE CLOUD — inner depth layer
   ============================================================ */

function InnerParticles() {
  const ref = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 600;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    // Ferrari red and ion cyan
    const palette = [
      new THREE.Color("#DC0000"),
      new THREE.Color("#00D4FF"),
      new THREE.Color("#C9A84C"),
    ];

    for (let i = 0; i < count; i++) {
      // Random points in a shell between r=2.5 and r=5
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.5 + Math.random() * 2.5;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.015;
      ref.current.rotation.x = state.clock.elapsedTime * 0.007;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.7}
      />
    </points>
  );
}

/* ============================================================
   SCENE — everything inside Canvas
   ============================================================ */

function Scene() {
  return (
    <>
      <CameraRig />

      {/* Lights */}
      <ambientLight intensity={0.06} />
      <pointLight
        color="#00D4FF"
        intensity={3}
        position={[0, 4, 5]}
        distance={22}
        decay={2}
      />
      <pointLight
        color="#ffffff"
        intensity={0.4}
        position={[5, -2, 4]}
        distance={18}
        decay={2}
      />

      {/* Deep space starfield */}
      <Stars
        radius={90}
        depth={55}
        count={4500}
        factor={3.5}
        saturation={0.05}
        fade
      />

      {/* Inner colored particle shell */}
      <InnerParticles />

      {/* Background ambient shapes — very subtle */}
      <BackgroundShape
        position={[-7, 3.5, -10]}
        initialRotation={[0.3, 0.5, 0]}
        color="#00D4FF"
        size={0.8}
        speed={0.8}
      />
      <BackgroundShape
        position={[8, -2.5, -12]}
        initialRotation={[0.6, 0.2, 0.8]}
        color="#DC0000"
        size={1.0}
        speed={0.6}
      />
      <BackgroundShape
        position={[-5, -5, -8]}
        initialRotation={[0.1, 0.8, 0.3]}
        color="#00D4FF"
        size={0.6}
        speed={1.2}
      />
      <BackgroundShape
        position={[6, 5, -14]}
        initialRotation={[0.9, 0.1, 0.5]}
        color="#C9A84C"
        size={0.9}
        speed={0.5}
      />

      {/* Central orb */}
      <ArchitectOrb />

      {/* Orbital rings — three planes */}
      <OrbRing
        radius={2.05}
        color="#DC0000"
        rotation={[Math.PI * 0.22, 0, 0]}
        speed={0.38}
        opacity={0.55}
      />
      <OrbRing
        radius={2.85}
        color="#00D4FF"
        rotation={[Math.PI * 0.45, Math.PI * 0.15, 0]}
        speed={-0.24}
        opacity={0.32}
      />
      <OrbRing
        radius={3.7}
        color="#C9A84C"
        rotation={[Math.PI * 0.65, 0, Math.PI * 0.28]}
        speed={0.16}
        opacity={0.18}
      />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          mipmapBlur
          luminanceThreshold={0.08}
          luminanceSmoothing={0.2}
          intensity={2.8}
          radius={0.55}
        />
      </EffectComposer>
    </>
  );
}

/* ============================================================
   MAIN EXPORT
   ============================================================ */

export function ThreeScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 60 }}
      dpr={[1, 1.5]}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        background: "#000508",
      }}
      gl={{ antialias: false, alpha: false }}
      onCreated={({ gl }) => {
        gl.setClearColor("#000508", 1);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.2;
      }}
    >
      <AdaptiveDpr pixelated />
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
