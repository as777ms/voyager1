import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useReceiverStore } from '../../store/useReceiverStore';

export function Alien() {
  const alienGroup = useRef();
  const { scene } = useGLTF('/models/alien.glb');
  const reducedMotion = useReceiverStore((s) => s.reducedMotion);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.needsUpdate = true;
      }
    });
  }, [scene]);

  useFrame((state) => {
    if (alienGroup.current && !reducedMotion) {
      const time = state.clock.elapsedTime;
      alienGroup.current.position.y = 0.25 + Math.sin(time * 1.2) * 0.025;
    }
  });

  return (
    // Positioned on the left side above THE RECEIVER panel (X = -2.95, Y = 0.25, Z = 1.6)
    <group ref={alienGroup} position={[-2.70, 0.25, 1.6]} rotation={[0, 0.48, 0]}>
      <group position={[-0.17, -2.05, 0.05]}>
        <primitive object={scene} scale={0.205} />
      </group>
    </group>
  );
}

useGLTF.preload('/models/alien.glb');
