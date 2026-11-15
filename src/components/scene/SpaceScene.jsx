import { useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Earth } from './Earth';
import { Alien } from './Alien';
import { VoyagerDiscPlayer } from './VoyagerDiscPlayer';
import { OrbitalNetwork } from './OrbitalNetwork';
import { useReceiverStore } from '../../store/useReceiverStore';

const CAMERA_PRESETS = {
  overview: { pos: new THREE.Vector3(0, 0.3, 6.8), target: new THREE.Vector3(-0.15, 0.1, 0) },
  alien: { pos: new THREE.Vector3(-2.1, 0.25, 4.3), target: new THREE.Vector3(-2.95, 0.2, 1.6) },
  disc: { pos: new THREE.Vector3(1.6, 1.65, 1.8), target: new THREE.Vector3(3.2, 2.25, -4.0) },
  earth: { pos: new THREE.Vector3(0.35, 0.2, 4.6), target: new THREE.Vector3(0.35, -0.9, -4.5) },
};

function ResponsiveCameraController() {
  const controlsRef = useRef();
  const cameraPreset = useReceiverStore((s) => s.cameraPreset);
  const isUserControllingCamera = useReceiverStore((s) => s.isUserControllingCamera);
  const reducedMotion = useReceiverStore((s) => s.reducedMotion);
  const { size } = useThree();

  useFrame((state) => {
    if (isUserControllingCamera || !controlsRef.current) return;

    const preset = CAMERA_PRESETS[cameraPreset] || CAMERA_PRESETS.overview;
    const lerpSpeed = reducedMotion ? 0.1 : 0.045;

    const targetPos = preset.pos.clone();
    const targetLook = preset.target.clone();

    // Adaptive framing for tablets & mobile screens so Alien and Earth stay well-framed
    if (cameraPreset === 'overview') {
      if (size.width < 640) {
        targetPos.z += 2.6;
        targetPos.y += 0.25;
        targetLook.x = -0.35;
      } else if (size.width < 1024) {
        targetPos.z += 1.4;
        targetLook.x = -0.25;
      }
    }

    state.camera.position.lerp(targetPos, lerpSpeed);
    controlsRef.current.target.lerp(targetLook, lerpSpeed);
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      enablePan={false}
      minDistance={3.0}
      maxDistance={11.0}
      minPolarAngle={Math.PI / 2.35}
      maxPolarAngle={Math.PI / 1.92}
      minAzimuthAngle={-Math.PI / 5}
      maxAzimuthAngle={Math.PI / 5}
      onStart={() => useReceiverStore.setState({ isUserControllingCamera: true })}
    />
  );
}

export default function SpaceScene() {
  return (
    <div className="w-full h-full absolute inset-0 bg-[#02050d]">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.3, 6.8], fov: 44 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
      >
        {/* Balanced space lighting */}
        <ambientLight intensity={0.82} color="#f8fafc" />
        <directionalLight position={[5, 6, 4]} intensity={1.7} color="#ffffff" />
        <directionalLight position={[-6, 2, -2]} intensity={0.9} color="#38bdf8" />
        <directionalLight position={[0, 5, -8]} intensity={1.15} color="#60a5fa" />
        <pointLight position={[-2.4, 0.8, 2.5]} intensity={1.1} color="#fef08a" distance={5} />

        {/* Distant starfield */}
        <Stars
          radius={90}
          depth={50}
          count={4200}
          factor={3}
          saturation={0.5}
          fade
          speed={0.5}
        />

        <Suspense fallback={null}>
          {/* 1. Earth: positioned in center/right-center */}
          <Earth />

          {/* 2. Alien: anchored on the far-left above THE RECEIVER panel */}
          <Alien />

          {/* 3. Voyager Golden Record: holographic golden disc above Earth */}
          <VoyagerDiscPlayer />

          {/* 4. Orbital Satellites & Blue Communication Transmission Lines */}
          <OrbitalNetwork />

          <ResponsiveCameraController />
        </Suspense>
      </Canvas>
    </div>
  );
}
