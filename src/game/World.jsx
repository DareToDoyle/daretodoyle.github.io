import { useEffect, useMemo } from 'react'
import { Edges, RoundedBox, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import PointOfInterest from './PointOfInterest'
import {
  benches,
  bushes,
  fences,
  gardenTiles,
  lamps,
  rocks,
  trees,
} from '../data/worldData'

const palette = {
  ink: '#171716',
  charcoal: '#30302e',
  dark: '#5d5d58',
  foliage: '#898983',
  foliageLight: '#aaa9a2',
  path: '#ecece6',
  terrain: '#cfcfc9',
  terrainDark: '#b8b8b1',
  white: '#f7f7f2',
}

function ToonBox({ args, color, radius = 0.06, children, ...props }) {
  return (
    <RoundedBox args={args} radius={radius} smoothness={3} castShadow receiveShadow {...props}>
      <meshToonMaterial color={color} />
      {children}
    </RoundedBox>
  )
}

function Path({ from, to, width = 1.5 }) {
  const dx = to[0] - from[0]
  const dz = to[1] - from[1]
  const length = Math.hypot(dx, dz)
  const angle = Math.atan2(dx, dz)
  const tileCount = Math.max(2, Math.floor(length / 0.74))

  return (
    <group>
      <ToonBox
        args={[width, 0.075, length]}
        color={palette.path}
        radius={0.18}
        position={[(from[0] + to[0]) / 2, 0.07, (from[1] + to[1]) / 2]}
        rotation={[0, angle, 0]}
      />
      {Array.from({ length: tileCount - 1 }, (_, index) => {
        const progress = (index + 1) / tileCount
        return (
          <mesh
            key={progress}
            position={[
              THREE.MathUtils.lerp(from[0], to[0], progress),
              0.113,
              THREE.MathUtils.lerp(from[1], to[1], progress),
            ]}
            rotation={[-Math.PI / 2, 0, angle]}
          >
            <planeGeometry args={[width * 0.86, 0.018]} />
            <meshBasicMaterial color="#bdbdb7" transparent opacity={0.58} />
          </mesh>
        )
      })}
    </group>
  )
}

function Tree({ data }) {
  const [x, z, scale, rotation] = data
  return (
    <group position={[x, 0, z]} scale={scale} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.67, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.28, 1.25, 12]} />
        <meshToonMaterial color={palette.charcoal} />
      </mesh>
      <mesh position={[0, 1.62, 0]} scale={[1.08, 0.95, 1]} castShadow>
        <sphereGeometry args={[0.78, 18, 12]} />
        <meshToonMaterial color={palette.foliage} />
      </mesh>
      <mesh position={[-0.47, 1.48, 0.06]} scale={[0.9, 0.88, 0.9]} castShadow>
        <sphereGeometry args={[0.55, 16, 10]} />
        <meshToonMaterial color={palette.foliageLight} />
      </mesh>
      <mesh position={[0.44, 1.42, -0.08]} scale={[0.95, 0.86, 0.9]} castShadow>
        <sphereGeometry args={[0.58, 16, 10]} />
        <meshToonMaterial color={palette.dark} />
      </mesh>
      <mesh position={[0.05, 2.0, -0.04]} scale={[0.78, 0.72, 0.8]} castShadow>
        <sphereGeometry args={[0.58, 16, 10]} />
        <meshToonMaterial color={palette.foliageLight} />
      </mesh>
    </group>
  )
}

function Bush({ data }) {
  const [x, z, scale] = data
  return (
    <group position={[x, 0.12, z]} scale={scale}>
      {[-0.3, 0, 0.3].map((offset, index) => (
        <mesh key={offset} position={[offset, 0.28 + (index === 1 ? 0.12 : 0), index === 1 ? -0.08 : 0]} castShadow>
          <sphereGeometry args={[index === 1 ? 0.42 : 0.34, 14, 10]} />
          <meshToonMaterial color={index === 1 ? palette.foliageLight : palette.foliage} />
        </mesh>
      ))}
    </group>
  )
}

function Rock({ data }) {
  const [x, z, scale] = data
  return (
    <mesh position={[x, scale * 0.48, z]} scale={[scale * 1.25, scale, scale]} rotation={[0.05, x * 0.2, -0.05]} castShadow>
      <sphereGeometry args={[0.7, 10, 7]} />
      <meshToonMaterial color={palette.dark} />
      <Edges color={palette.ink} threshold={28} />
    </mesh>
  )
}

function Bench({ data }) {
  const [x, z, rotation] = data
  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      {[-0.45, 0, 0.45].map((offset) => (
        <mesh key={offset} position={[offset, 0.45, 0]} castShadow>
          <boxGeometry args={[0.39, 0.15, 0.58]} />
          <meshToonMaterial color={palette.dark} />
        </mesh>
      ))}
      <mesh position={[0, 0.82, -0.23]} rotation={[-0.13, 0, 0]} castShadow>
        <boxGeometry args={[1.62, 0.55, 0.13]} />
        <meshToonMaterial color={palette.foliageLight} />
      </mesh>
      {[-0.55, 0.55].map((offset) => (
        <mesh key={offset} position={[offset, 0.22, 0]}>
          <boxGeometry args={[0.12, 0.44, 0.42]} />
          <meshToonMaterial color={palette.ink} />
        </mesh>
      ))}
    </group>
  )
}

function Lamp({ data }) {
  const [x, z] = data
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.09, 1.55, 10]} />
        <meshToonMaterial color={palette.ink} />
      </mesh>
      <ToonBox args={[0.38, 0.38, 0.38]} position={[0, 1.57, 0]} color={palette.white} radius={0.09} />
      <mesh position={[0, 1.57, 0]}>
        <boxGeometry args={[0.47, 0.07, 0.47]} />
        <meshToonMaterial color={palette.ink} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.1, 14]} />
        <meshToonMaterial color={palette.ink} />
      </mesh>
    </group>
  )
}

function Fence({ data }) {
  const horizontal = data.halfX > data.halfZ
  const length = horizontal ? data.halfX * 2 : data.halfZ * 2
  const rotation = horizontal ? 0 : Math.PI / 2
  return (
    <group position={[data.x, 0, data.z]} rotation={[0, rotation, 0]}>
      {[-length / 2, 0, length / 2].map((x) => (
        <mesh key={x} position={[x, 0.42, 0]} castShadow>
          <boxGeometry args={[0.13, 0.84, 0.13]} />
          <meshToonMaterial color={palette.ink} />
        </mesh>
      ))}
      {[0.3, 0.6].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <boxGeometry args={[length, 0.1, 0.1]} />
          <meshToonMaterial color={palette.charcoal} />
        </mesh>
      ))}
    </group>
  )
}

function GardenTile({ data, index }) {
  const [x, z] = data
  return (
    <group position={[x, 0.09, z]}>
      <ToonBox args={[0.42, 0.09, 0.42]} color={palette.terrainDark} radius={0.04} />
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.035, 0.3, 8]} />
        <meshToonMaterial color={palette.ink} />
      </mesh>
      <mesh position={[0, 0.39, 0]} rotation={[0, index * 0.8, 0]} castShadow>
        <sphereGeometry args={[0.11, 8, 6]} />
        <meshToonMaterial color={index % 2 ? palette.white : palette.foliage} />
      </mesh>
    </group>
  )
}

function LogoMonument() {
  const texture = useTexture(`${import.meta.env.BASE_URL}logo.png`)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4

  return (
    <group position={[0, 0.15, -1.3]}>
      <RoundedBox args={[3.55, 2.15, 0.3]} radius={0.13} smoothness={3} position={[0, 1.62, 0]} castShadow>
        <meshToonMaterial color={palette.white} />
        <Edges color={palette.ink} threshold={18} />
      </RoundedBox>
      <mesh position={[0, 1.62, 0.158]}>
        <planeGeometry args={[3.12, 1.72]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {[-1.2, 1.2].map((x) => (
        <mesh key={x} position={[x, 0.5, -0.04]} castShadow>
          <cylinderGeometry args={[0.12, 0.18, 0.98, 12]} />
          <meshToonMaterial color={palette.ink} />
        </mesh>
      ))}
      <mesh position={[0, 0.07, 0]} receiveShadow>
        <cylinderGeometry args={[1.28, 1.5, 0.14, 16]} />
        <meshToonMaterial color={palette.dark} />
      </mesh>
    </group>
  )
}

function Island({ geometry }) {
  return (
    <>
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.57, 0]} scale={[1.035, 1.035, 1]} receiveShadow>
        <meshToonMaterial color={palette.ink} />
      </mesh>
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.43, 0]} receiveShadow>
        <meshToonMaterial color={palette.terrain} />
      </mesh>
    </>
  )
}

export default function World({ pois, controllerRef, paused, onMoveIntent }) {
  const islandGeometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-6.2, -8.9)
    shape.bezierCurveTo(-9.2, -8.2, -10.5, -5.5, -10.15, -2.3)
    shape.bezierCurveTo(-11.0, 0.6, -9.7, 4.7, -8.0, 7.1)
    shape.bezierCurveTo(-5.6, 9.15, -2.1, 9.35, 0.25, 8.95)
    shape.bezierCurveTo(3.5, 9.55, 7.5, 8.5, 9.2, 5.8)
    shape.bezierCurveTo(10.75, 3.0, 10.65, -0.8, 9.8, -3.2)
    shape.bezierCurveTo(9.6, -6.6, 7.1, -8.5, 4.3, -9.0)
    shape.bezierCurveTo(0.6, -9.55, -2.8, -9.2, -6.2, -8.9)
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.42,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.16,
      bevelThickness: 0.12,
      curveSegments: 5,
    })
    geometry.computeVertexNormals()
    return geometry
  }, [])

  useEffect(() => () => islandGeometry.dispose(), [islandGeometry])

  useEffect(() => {
    const release = (event) => {
      if (
        controllerRef.current.pointerId === null ||
        controllerRef.current.pointerId === event.pointerId
      ) {
        controllerRef.current.active = false
        controllerRef.current.pointerId = null
      }
    }
    window.addEventListener('pointerup', release)
    window.addEventListener('pointercancel', release)
    return () => {
      window.removeEventListener('pointerup', release)
      window.removeEventListener('pointercancel', release)
    }
  }, [controllerRef])

  const updateControl = (event) => {
    controllerRef.current.point.set(event.point.x, 0, event.point.z)
  }

  const handlePointerDown = (event) => {
    if (paused || (event.pointerType === 'mouse' && event.button !== 0)) return
    event.stopPropagation()
    event.target.setPointerCapture?.(event.pointerId)
    controllerRef.current.active = true
    controllerRef.current.pointerId = event.pointerId
    updateControl(event)
    onMoveIntent()
  }

  const handlePointerMove = (event) => {
    if (!controllerRef.current.active || controllerRef.current.pointerId !== event.pointerId) return
    event.stopPropagation()
    updateControl(event)
  }

  const handlePointerUp = (event) => {
    if (controllerRef.current.pointerId !== event.pointerId) return
    event.stopPropagation()
    controllerRef.current.active = false
    controllerRef.current.pointerId = null
    event.target.releasePointerCapture?.(event.pointerId)
  }

  return (
    <>
      <color attach="background" args={['#111110']} />
      <fog attach="fog" args={['#111110', 15, 28]} />

      <hemisphereLight intensity={1.45} color="#ffffff" groundColor="#3c3c38" />
      <directionalLight
        position={[-8, 13, 7]}
        intensity={2.15}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0003}
      />

      <Island geometry={islandGeometry} />

      <mesh
        position={[0, 0.18, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <circleGeometry args={[12, 48]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>

      <Path from={[0, -7.8]} to={[0, 7.9]} width={1.55} />
      <Path from={[-7.45, 0]} to={[7.45, 0]} width={1.55} />
      <Path from={[-6.0, -4.2]} to={[0, 0]} width={1.25} />
      <Path from={[5.9, -3.9]} to={[0, 0]} width={1.25} />
      <Path from={[5.5, 4.0]} to={[0, 0]} width={1.25} />
      <Path from={[-5.4, 4.2]} to={[0, 0]} width={1.25} />

      {[
        [-6, -4.2, 4.4, 3.8],
        [5.9, -3.9, 4.4, 3.8],
        [5.5, 4, 4.4, 3.8],
        [-5.4, 4.2, 4.4, 3.8],
        [0, 7, 5.0, 3.5],
      ].map(([x, z, width, depth]) => (
        <ToonBox key={`${x}-${z}`} args={[width, 0.08, depth]} position={[x, 0.045, z]} color={palette.terrainDark} radius={0.35} />
      ))}

      <mesh position={[0, 0.12, 0]} receiveShadow>
        <cylinderGeometry args={[3.0, 3.15, 0.2, 16]} />
        <meshToonMaterial color={palette.path} />
      </mesh>
      <mesh position={[0, 0.225, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.48, 2.54, 32]} />
        <meshBasicMaterial color={palette.ink} />
      </mesh>
      <LogoMonument />

      {pois.map((poi) => <PointOfInterest key={poi.id} poi={poi} />)}
      {trees.map((data) => <Tree key={`${data[0]}-${data[1]}`} data={data} />)}
      {bushes.map((data) => <Bush key={`${data[0]}-${data[1]}`} data={data} />)}
      {rocks.map((data) => <Rock key={`${data[0]}-${data[1]}`} data={data} />)}
      {benches.map((data) => <Bench key={`${data[0]}-${data[1]}`} data={data} />)}
      {lamps.map((data) => <Lamp key={`${data[0]}-${data[1]}`} data={data} />)}
      {fences.map((data) => <Fence key={`${data.x}-${data.z}`} data={data} />)}
      {gardenTiles.map((data, index) => <GardenTile key={`${data[0]}-${data[1]}`} data={data} index={index} />)}
    </>
  )
}
