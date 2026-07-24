import { useEffect, useRef } from 'react'
import { Edges, RoundedBox, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import PointOfInterest from './PointOfInterest'
import { benches, lamps, rocks, trees, WORLD_BOUNDS } from '../data/worldData'

const palette = {
  ink: '#171716',
  charcoal: '#292927',
  dark: '#50504c',
  mid: '#91918b',
  path: '#bdbdb7',
  ground: '#dadad5',
  light: '#ededE8',
  white: '#fafaf7',
}

function Path({ from, to, width = 1.35 }) {
  const dx = to[0] - from[0]
  const dz = to[1] - from[1]
  const length = Math.sqrt(dx * dx + dz * dz)
  const angle = Math.atan2(dx, dz)

  return (
    <mesh
      position={[(from[0] + to[0]) / 2, 0.025, (from[1] + to[1]) / 2]}
      rotation={[0, angle, 0]}
      receiveShadow
    >
      <boxGeometry args={[width, 0.055, length]} />
      <meshStandardMaterial color={palette.path} roughness={1} />
    </mesh>
  )
}

function Tree({ position }) {
  const [x, z, scale] = position
  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.22, 1.4, 7]} />
        <meshStandardMaterial color={palette.charcoal} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.7, 0]} castShadow>
        <dodecahedronGeometry args={[0.78, 0]} />
        <meshStandardMaterial color={palette.light} roughness={0.96} flatShading />
        <Edges color={palette.ink} threshold={16} />
      </mesh>
      <mesh position={[-0.36, 1.45, 0.12]} castShadow>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color={palette.mid} roughness={0.96} flatShading />
      </mesh>
    </group>
  )
}

function Rock({ position }) {
  const [x, z, scale] = position
  return (
    <mesh position={[x, scale * 0.48, z]} scale={[scale * 1.2, scale, scale]} rotation={[0.1, x, -0.1]} castShadow>
      <dodecahedronGeometry args={[0.7, 0]} />
      <meshStandardMaterial color={palette.dark} roughness={1} flatShading />
      <Edges color={palette.ink} threshold={20} />
    </mesh>
  )
}

function Bench({ position }) {
  const [x, z, rotation] = position
  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[1.65, 0.16, 0.48]} />
        <meshStandardMaterial color={palette.dark} />
      </mesh>
      <mesh position={[0, 0.8, -0.2]} rotation={[-0.16, 0, 0]} castShadow>
        <boxGeometry args={[1.65, 0.62, 0.12]} />
        <meshStandardMaterial color={palette.light} />
      </mesh>
      {[-0.58, 0.58].map((legX) => (
        <mesh key={legX} position={[legX, 0.2, 0]}>
          <boxGeometry args={[0.11, 0.42, 0.38]} />
          <meshStandardMaterial color={palette.ink} />
        </mesh>
      ))}
    </group>
  )
}

function Lamp({ position }) {
  const [x, z] = position
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.075, 1.8, 8]} />
        <meshStandardMaterial color={palette.ink} />
      </mesh>
      <mesh position={[0, 1.82, 0]} castShadow>
        <octahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial color={palette.white} emissive={palette.white} emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.22, 0.29, 0.08, 12]} />
        <meshStandardMaterial color={palette.ink} />
      </mesh>
    </group>
  )
}

function LogoMonument() {
  const texture = useTexture(`${import.meta.env.BASE_URL}logo.png`)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4

  return (
    <group position={[0, 0, -1.35]}>
      <RoundedBox args={[3.7, 2.35, 0.34]} radius={0.12} smoothness={2} position={[0, 1.65, 0]} castShadow>
        <meshStandardMaterial color={palette.white} roughness={0.72} />
        <Edges color={palette.ink} threshold={16} />
      </RoundedBox>
      <mesh position={[0, 1.65, 0.178]}>
        <planeGeometry args={[3.25, 1.9]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {[-1.25, 1.25].map((x) => (
        <mesh key={x} position={[x, 0.48, -0.04]} castShadow>
          <cylinderGeometry args={[0.11, 0.16, 0.95, 8]} />
          <meshStandardMaterial color={palette.ink} />
        </mesh>
      ))}
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[1.2, 1.4, 0.16, 20]} />
        <meshStandardMaterial color={palette.dark} />
      </mesh>
    </group>
  )
}

function FenceLine({ z }) {
  const positions = [-7.7, -5.7, -3.7, 3.7, 5.7, 7.7]
  return (
    <group>
      {positions.map((x) => (
        <mesh key={x} position={[x, 0.35, z]} castShadow>
          <boxGeometry args={[0.12, 0.7, 0.12]} />
          <meshStandardMaterial color={palette.ink} />
        </mesh>
      ))}
      <mesh position={[-5.7, 0.35, z]}>
        <boxGeometry args={[4.05, 0.08, 0.1]} />
        <meshStandardMaterial color={palette.ink} />
      </mesh>
      <mesh position={[5.7, 0.35, z]}>
        <boxGeometry args={[4.05, 0.08, 0.1]} />
        <meshStandardMaterial color={palette.ink} />
      </mesh>
    </group>
  )
}

function TargetMarker({ targetRef, reducedMotion }) {
  const markerRef = useRef(null)

  useFrame((state) => {
    const marker = markerRef.current
    const target = targetRef.current
    if (!marker) return
    marker.visible = Boolean(target)
    if (!target) return
    marker.position.set(target.x, 0.09, target.z)
    if (!reducedMotion) {
      marker.rotation.z = state.clock.elapsedTime * 0.65
      marker.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 5) * 0.08)
    }
  })

  return (
    <group ref={markerRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <mesh>
        <ringGeometry args={[0.25, 0.31, 20]} />
        <meshBasicMaterial color={palette.ink} />
      </mesh>
      <mesh>
        <ringGeometry args={[0.43, 0.455, 20]} />
        <meshBasicMaterial color={palette.ink} transparent opacity={0.4} />
      </mesh>
    </group>
  )
}

export default function World({ pois, targetRef, paused, onMoveIntent, reducedMotion }) {
  const draggingRef = useRef(false)

  useEffect(() => {
    const release = () => {
      draggingRef.current = false
    }
    window.addEventListener('pointerup', release)
    window.addEventListener('pointercancel', release)
    return () => {
      window.removeEventListener('pointerup', release)
      window.removeEventListener('pointercancel', release)
    }
  }, [])

  const setTarget = (event) => {
    if (paused) return
    const x = THREE.MathUtils.clamp(event.point.x, WORLD_BOUNDS.minX + 0.25, WORLD_BOUNDS.maxX - 0.25)
    const z = THREE.MathUtils.clamp(event.point.z, WORLD_BOUNDS.minZ + 0.25, WORLD_BOUNDS.maxZ - 0.25)
    targetRef.current = new THREE.Vector3(x, 0, z)
    onMoveIntent()
  }

  const handlePointerDown = (event) => {
    event.stopPropagation()
    draggingRef.current = true
    setTarget(event)
  }

  const handlePointerMove = (event) => {
    if (draggingRef.current) setTarget(event)
  }

  return (
    <>
      <color attach="background" args={['#111110']} />
      <fog attach="fog" args={['#111110', 18, 34]} />

      <ambientLight intensity={1.35} />
      <directionalLight
        position={[-8, 14, 6]}
        intensity={2.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0004}
      />

      <RoundedBox
        args={[19, 0.65, 17.4]}
        radius={0.5}
        smoothness={3}
        position={[0, -0.36, 0]}
        receiveShadow
      >
        <meshStandardMaterial color={palette.ground} roughness={0.94} />
        <Edges color={palette.ink} threshold={14} />
      </RoundedBox>

      <mesh
        position={[0, 0.005, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        <planeGeometry args={[18.3, 16.5]} />
        <meshStandardMaterial color={palette.ground} roughness={1} />
      </mesh>

      <Path from={[0, -6.6]} to={[0, 6.5]} width={1.35} />
      <Path from={[-7.2, 0]} to={[7.2, 0]} width={1.35} />
      <Path from={[-5.6, -4.45]} to={[5.55, 4.15]} width={1.05} />
      <Path from={[5.55, -4.45]} to={[-5.55, 4.15]} width={1.05} />

      <mesh position={[0, 0.055, 0]} receiveShadow>
        <cylinderGeometry args={[2.7, 2.7, 0.11, 40]} />
        <meshStandardMaterial color={palette.light} roughness={0.96} />
      </mesh>
      <mesh position={[0, 0.116, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.22, 2.28, 48]} />
        <meshBasicMaterial color={palette.ink} />
      </mesh>

      <LogoMonument />

      {pois.map((poi) => (
        <PointOfInterest key={poi.id} poi={poi} reducedMotion={reducedMotion} />
      ))}
      {trees.map((position) => <Tree key={`${position[0]}-${position[1]}`} position={position} />)}
      {rocks.map((position) => <Rock key={`${position[0]}-${position[1]}`} position={position} />)}
      {benches.map((position) => <Bench key={`${position[0]}-${position[1]}`} position={position} />)}
      {lamps.map((position) => <Lamp key={`${position[0]}-${position[1]}`} position={position} />)}

      <FenceLine z={-7.35} />
      <FenceLine z={7.35} />
      <TargetMarker targetRef={targetRef} reducedMotion={reducedMotion} />
    </>
  )
}
