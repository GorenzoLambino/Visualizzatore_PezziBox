import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Edges } from '@react-three/drei';

export function Scene3D({ boxDims, items }) {
  const [bx, by, bz] = boxDims;

  return (
    <Canvas camera={{ position: [Math.max(bx, by, bz) * 1.5, Math.max(bx, by, bz), Math.max(bx, by, bz) * 1.5], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1} />
      
      {/* Axes Helper placed at the bottom-left-back corner */}
      <axesHelper args={[Math.max(bx, by, bz) * 1.2]} position={[-bx / 2, -by / 2, -bz / 2]} />

      {/* Box Wireframe */}
      {bx > 0 && by > 0 && bz > 0 && (
        <mesh>
          <boxGeometry args={[bx, by, bz]} />
          <meshBasicMaterial transparent opacity={0} />
          <Edges scale={1} threshold={15} color="#888888" />
        </mesh>
      )}

      {/* Items */}
      {items.map((item, index) => (
        <mesh key={index} position={item.position}>
          <boxGeometry args={item.size} />
          <meshStandardMaterial color="#3b82f6" opacity={0.8} transparent />
          <Edges scale={1} threshold={15} color="#1d4ed8" />
        </mesh>
      ))}

      <OrbitControls makeDefault />
    </Canvas>
  );
}
