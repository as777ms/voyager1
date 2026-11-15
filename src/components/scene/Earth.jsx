import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useReceiverStore } from '../../store/useReceiverStore';

export function Earth() {
  const earthRef = useRef();
  const { scene } = useGLTF('/models/earth.glb');
  const reducedMotion = useReceiverStore((s) => s.reducedMotion);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        if (child.material.roughness !== undefined && child.material.roughness < 0.25) {
          child.material.roughness = 0.62;
        }
        if (child.material.metalness !== undefined) {
          child.material.metalness = 0.05;
        }
        child.material.needsUpdate = true;
      }
    });
  }, [scene]);

  useFrame((_, delta) => {
    if (earthRef.current && !reducedMotion) {
      earthRef.current.rotation.y += delta * 0.045;
    }
  });

  return (
    // Earth positioned in center/right-center [0.35, -3.75, -4.5]
    // Upper hemisphere curves across the bottom half of the scene behind foreground elements
    <group position={[2.35, -3.75, -2.5]} rotation={[THREE.MathUtils.degToRad(20), 0, 0]}>
      <group ref={earthRef}>
        <primitive object={scene} scale={0.0053} />
      </group>

      {/* Subtle Cyan Atmospheric Rim Glow */}
      <mesh position={[0, 0, 0]}>
        <ringGeometry args={[1.28, 1.46, 96]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.28} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

useGLTF.preload('/models/earth.glb');
