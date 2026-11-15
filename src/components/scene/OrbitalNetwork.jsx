import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { useReceiverStore } from '../../store/useReceiverStore';
import { audioEngine } from '../../audio/AudioEngine';

function MinimalSatellite({ position, rotation, scale = 0.85 }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const reducedMotion = useReceiverStore((s) => s.reducedMotion);
  const isPlaying = useReceiverStore((s) => s.isPlaying);
  const togglePlay = useReceiverStore((s) => s.togglePlay);

  useFrame((state) => {
    if (ref.current && !reducedMotion) {
      const t = state.clock.elapsedTime;
      ref.current.position.y = position[1] + Math.sin(t * 0.9) * 0.03;
      ref.current.rotation.z = rotation[2] + Math.cos(t * 0.6) * 0.03;
    }
  });

  return (
    <group
      ref={ref}
      position={position}
      rotation={rotation}
      scale={hovered ? scale * 1.08 : scale}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        audioEngine.unlockSync();
        audioEngine.playHudPing(880);
        togglePlay();
      }}
    >
      {/* Sleek Gold Foil Spacecraft Core */}
      <mesh>
        <cylinderGeometry args={[0.068, 0.068, 0.24, 16]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.22} />
      </mesh>

      {/* Clean High-Gain Dish */}
      <mesh position={[0, 0.15, 0.04]} rotation={[0.38, 0, 0]}>
        <coneGeometry args={[0.11, 0.055, 20, 1, true]} />
        <meshStandardMaterial
          color="#e2e8f0"
          metalness={0.9}
          roughness={0.18}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Left Solar Wing */}
      <mesh position={[-0.36, 0, 0]}>
        <boxGeometry args={[0.52, 0.01, 0.15]} />
        <meshStandardMaterial
          color="#0284c7"
          emissive="#0369a1"
          emissiveIntensity={isPlaying || hovered ? 0.55 : 0.3}
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>

      {/* Right Solar Wing */}
      <mesh position={[0.36, 0, 0]}>
        <boxGeometry args={[0.52, 0.01, 0.15]} />
        <meshStandardMaterial
          color="#0284c7"
          emissive="#0369a1"
          emissiveIntensity={isPlaying || hovered ? 0.55 : 0.3}
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>

      {/* Subtle Status Beacon */}
      <mesh position={[0, 0, 0.08]}>
        <sphereGeometry args={[0.02, 12, 12]} />
        <meshBasicMaterial color={isPlaying ? '#38bdf8' : '#7dd3fc'} />
      </mesh>
    </group>
  );
}

export function OrbitalNetwork() {
  const pulseRef = useRef();
  const isPlaying = useReceiverStore((s) => s.isPlaying);
  const reducedMotion = useReceiverStore((s) => s.reducedMotion);

  // Single clean relay link: Satellite -> Alien Receiver
  const relayLink = useMemo(
    () => [
      new THREE.Vector3(-0.75, 1.15, -0.9),
      new THREE.Vector3(-2.35, 0.15, 1.1),
    ],
    []
  );

  useFrame((state) => {
    if (pulseRef.current && !reducedMotion) {
      const u = (state.clock.elapsedTime * (isPlaying ? 0.45 : 0.18)) % 1;
      pulseRef.current.position.lerpVectors(relayLink[0], relayLink[1], u);
    }
  });

  return (
    <group>
      {/* 1 Minimalist Orbital Relay Satellite */}
      <MinimalSatellite
        position={[-0.75, 1.15, -0.9]}
        rotation={[0.3, -0.25, 0.48]}
        scale={0.85}
      />

      {/* Subtle Orbital Path */}
      {/* <Line
        points={orbitalArcPoints}
        color="#38bdf8"
        lineWidth={1.0}
        transparent
        opacity={0.28}
      /> */}

      {/* Single Clean Signal Line from Satellite to Receiver */}
      <Line
        points={relayLink}
        color="#38bdf8"
        lineWidth={isPlaying ? 1.2 : 0.8}
        transparent
        opacity={isPlaying ? 0.48 : 0.22}
      />

      {/* Single Subtle Traveling Signal Dot */}
      <mesh ref={pulseRef} position={relayLink[0]}>
        <sphereGeometry args={[0.022, 10, 10]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={isPlaying ? 0.9 : 0.45} />
      </mesh>
    </group>
  );
}
