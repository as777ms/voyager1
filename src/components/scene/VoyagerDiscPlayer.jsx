import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useReceiverStore } from '../../store/useReceiverStore';
import voyagerImg from './record_voyager.jpeg';

export function VoyagerDiscPlayer() {
  const discRef = useRef();
  const [hovered, setHovered] = useState(false);
  const sourceTexture = useTexture(voyagerImg);

  const isPlaying = useReceiverStore((s) => s.isPlaying);
  const togglePlay = useReceiverStore((s) => s.togglePlay);
  const reducedMotion = useReceiverStore((s) => s.reducedMotion);

  // Draw the image into a rounded rectangle on a canvas.
  const roundedTexture = useMemo(() => {
    const image = sourceTexture.image;
    const canvas = document.createElement('canvas');
    const width = image.width;
    const height = image.height;

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) return sourceTexture;

    // Radius is proportional to the image size. Increase 0.08 for rounder corners.
    const cornerRadius = Math.min(width, height) * 50.08;

    context.beginPath();
    context.roundRect(0, 0, width, height, cornerRadius);
    context.clip();
    context.drawImage(image, 0, 0, width, height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    return texture;
  }, [sourceTexture]);

  useFrame((_, delta) => {
    if (discRef.current && isPlaying && !reducedMotion) {
      discRef.current.rotation.z -= delta * 0.65;
    }
  });

  return (
    <group
      position={[3.55, 2.45, -4.2]}
      scale={1.5}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        togglePlay();
      }}
    >
      {/* Image with rounded corners */}
      <mesh ref={discRef}>
        <planeGeometry args={[1.64, 1.64]} />
        <meshBasicMaterial
          map={roundedTexture}
          transparent
          toneMapped={false}
          side={THREE.DoubleSide}
          color={hovered ? '#dff7ff' : '#ffffff'}
        />
      </mesh>
    </group>
  );
}
