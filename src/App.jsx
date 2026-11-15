import { useState } from 'react';
import SpaceScene from './components/scene/SpaceScene';
import MainInterface from './components/interface/MainInterface';
import SciFiLoader from './components/loader/SciFiLoader';

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-gray-950 font-sans select-none">
      {/* 3D Scene Layer (Always rendered so models stream and pre-cache) */}
      <SpaceScene />

      {/* Main Interactive Interface HUD */}
      {hasEntered && <MainInterface />}

      {/* Futuristic GLB Model Loader & Sound Unlock Overlay */}
      {!hasEntered && (
        <SciFiLoader onEnter={() => setHasEntered(true)} />
      )}
    </main>
  );
}
