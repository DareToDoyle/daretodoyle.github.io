import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function ParticleShell({ mobile, reducedMotion }) {
  const pointsRef = useRef(null)
  const count = mobile ? 90 : 180
  const positions = useMemo(() => {
    const values = new Float32Array(count * 3)
    for (let index = 0; index < count; index += 1) {
      const phi = Math.acos(-1 + (2 * index) / count)
      const theta = Math.sqrt(count * Math.PI) * phi
      const radius = 1.7 + ((index % 7) / 7) * 0.18
      values[index * 3] = radius * Math.cos(theta) * Math.sin(phi)
      values[index * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi)
      values[index * 3 + 2] = radius * Math.cos(phi)
    }
    return values
  }, [count])

  useFrame((_, delta) => {
    if (!reducedMotion && pointsRef.current) pointsRef.current.rotation.y -= delta * 0.035
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#f2f1e8" size={mobile ? 0.018 : 0.022} transparent opacity={0.48} />
    </points>
  )
}

function Core({ mobile, reducedMotion, scrollProgress }) {
  const groupRef = useRef(null)
  const wireRef = useRef(null)

  useFrame((state, delta) => {
    const group = groupRef.current
    if (!group) return

    const pointerX = reducedMotion ? 0 : state.pointer.x * 0.18
    const pointerY = reducedMotion ? 0 : state.pointer.y * 0.12
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, pointerX + scrollProgress.current * 0.7, 3, delta)
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, -pointerY + scrollProgress.current * 0.25, 3, delta)

    if (!reducedMotion && wireRef.current) {
      wireRef.current.rotation.z += delta * 0.07
      wireRef.current.rotation.x -= delta * 0.04
    }
  })

  return (
    <group ref={groupRef}>
      <Float speed={reducedMotion ? 0 : 1.25} rotationIntensity={0.16} floatIntensity={0.22}>
        <mesh>
          <icosahedronGeometry args={[1.2, mobile ? 2 : 4]} />
          <MeshDistortMaterial
            color="#d7ff3f"
            roughness={0.48}
            metalness={0.08}
            distort={reducedMotion ? 0 : 0.26}
            speed={reducedMotion ? 0 : 1.25}
          />
        </mesh>
        <mesh ref={wireRef} scale={1.22}>
          <icosahedronGeometry args={[1.2, mobile ? 1 : 2]} />
          <meshBasicMaterial color="#f2f1e8" wireframe transparent opacity={0.19} />
        </mesh>
        <ParticleShell mobile={mobile} reducedMotion={reducedMotion} />
      </Float>
    </group>
  )
}

export default function CoreScene({ scrollProgress }) {
  const mobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 720px)').matches
  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <Canvas
      dpr={mobile ? 1 : [1, 1.5]}
      camera={{ position: [0, 0, 4.7], fov: 42 }}
      gl={{ alpha: true, antialias: !mobile, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} color="#ffffff" />
      <pointLight position={[-3, -2, 2]} intensity={8} color="#d7ff3f" />
      <Core mobile={mobile} reducedMotion={reducedMotion} scrollProgress={scrollProgress} />
    </Canvas>
  )
}
