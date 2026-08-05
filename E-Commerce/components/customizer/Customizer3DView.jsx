import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// 3D Frame component
function FrameModel({ frameColor, frameThickness, marginType, image, frameSize }) {
  // Use parsed size from Customizer
  const width = parseFloat(frameSize?.pW || 12) / 10; // Scale down for 3D space
  const height = parseFloat(frameSize?.pH || 8) / 10;
  
  // Parse thickness, e.g. "1.5"
  const thickness = (parseFloat(frameThickness?.value) || 1) / 10; 
  
  const hasMargin = marginType?.value === 'white';
  const marginWidth = hasMargin ? 0.15 : 0; // 3D margin width

  // Load uploaded image as texture safely and configure for high quality
  const [texture, setTexture] = React.useState(null);
  React.useEffect(() => {
    if (image) {
      new THREE.TextureLoader().load(image, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 16;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        
        // Simulate objectFit: 'cover' to prevent stretching/squishing
        const imgAspect = tex.image.width / tex.image.height;
        const planeAspect = width / height;
        
        if (imgAspect > planeAspect) {
          // Image is wider than plane
          tex.repeat.set(planeAspect / imgAspect, 1);
          tex.offset.set((1 - planeAspect / imgAspect) / 2, 0);
        } else {
          // Image is taller than plane
          tex.repeat.set(1, imgAspect / planeAspect);
          tex.offset.set(0, (1 - imgAspect / planeAspect) / 2);
        }
        
        setTexture(tex);
      });
    } else {
      setTexture(null);
    }
  }, [image, width, height]);

  const colorHex = frameColor?.value || '#222222';

  return (
    <group position={[0, 0, 0]}>
      {/* Shadow directly under the centered frame */}
      <ContactShadows position={[0, -height/2 - thickness/2, 0]} opacity={0.4} scale={5} blur={2} far={2} />

      {/* Frame Border (4 boxes making up the frame) */}
      <mesh position={[0, height/2 + thickness/2, 0]}>
        <boxGeometry args={[width + thickness*2, thickness, thickness]} />
        <meshStandardMaterial color={colorHex} roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh position={[0, -height/2 - thickness/2, 0]}>
        <boxGeometry args={[width + thickness*2, thickness, thickness]} />
        <meshStandardMaterial color={colorHex} roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh position={[-width/2 - thickness/2, 0, 0]}>
        <boxGeometry args={[thickness, height, thickness]} />
        <meshStandardMaterial color={colorHex} roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh position={[width/2 + thickness/2, 0, 0]}>
        <boxGeometry args={[thickness, height, thickness]} />
        <meshStandardMaterial color={colorHex} roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Backboard */}
      <mesh position={[0, 0, -thickness/2 + 0.01]}>
        <boxGeometry args={[width, height, 0.02]} />
        <meshStandardMaterial color="#888888" roughness={0.9} />
      </mesh>

      {/* Margin (if white) */}
      {hasMargin && (
        <mesh position={[0, 0, -thickness/4]}>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial color="#ffffff" roughness={1} />
        </mesh>
      )}

      {/* Image / Canvas */}
      <mesh position={[0, 0, hasMargin ? -thickness/4 + 0.005 : -thickness/4]}>
        <planeGeometry args={[width - (marginWidth*2), height - (marginWidth*2)]} />
        {texture ? (
          <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
        ) : (
          <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
        )}
      </mesh>

      {/* Glass / Acrylic Front */}
      <mesh position={[0, 0, thickness/2 - 0.02]}>
        <planeGeometry args={[width, height]} />
        <meshPhysicalMaterial 
          transmission={1} 
          opacity={1} 
          metalness={0} 
          roughness={0} 
          ior={1.5} 
          thickness={0.01} 
          transparent={true} 
        />
      </mesh>
    </group>
  );
}

export default function Customizer3DView({ 
  image, 
  frameSize,
  frameColor,
  marginType,
  frameThickness
}) {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '400px', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, background: 'rgba(255,255,255,0.8)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.8125rem', fontWeight: 500, backdropFilter: 'blur(4px)' }}>
        Left Click: Rotate | Right Click: Pan | Scroll: Zoom
      </div>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 3], fov: 45 }} gl={{ antialias: true, preserveDrawingBuffer: true }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        <Environment preset="studio" />
        
        <Suspense fallback={null}>
          <group position={[0, 0, 0]}>
            <FrameModel 
              image={image} 
              frameSize={frameSize} 
              frameColor={frameColor} 
              marginType={marginType} 
              frameThickness={frameThickness} 
            />
          </group>
        </Suspense>

        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          minDistance={1}
          maxDistance={5}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
}
