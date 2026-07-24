import { useRef } from 'react'
import { Edges, Html, RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

const palette = {
  ink: '#171716',
  dark: '#3d3d3a',
  mid: '#85857f',
  light: '#e8e8e3',
  white: '#f7f7f3',
}

function OutlinedBox({ args, color = palette.light, radius = 0.08, children, ...props }) {
  return (
    <RoundedBox args={args} radius={radius} smoothness={2} castShadow receiveShadow {...props}>
      <meshStandardMaterial color={color} roughness={0.82} />
      <Edges color={palette.ink} threshold={18} />
      {children}
    </RoundedBox>
  )
}

function CameraStation() {
  return (
    <>
      <OutlinedBox args={[2, 1.25, 1.25]} position={[0, 0.72, 0]} />
      <mesh position={[0, 0.75, 0.72]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.44, 0.56, 0.35, 12]} />
        <meshStandardMaterial color={palette.ink} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.75, 0.93]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.04, 16]} />
        <meshStandardMaterial color={palette.white} roughness={0.35} />
      </mesh>
      <mesh position={[-0.6, 1.47, 0]}>
        <boxGeometry args={[0.42, 0.18, 0.4]} />
        <meshStandardMaterial color={palette.dark} />
      </mesh>
    </>
  )
}

function BroadcastBooth() {
  return (
    <>
      <OutlinedBox args={[1.9, 1.45, 1.4]} position={[0, 0.82, 0]} color={palette.dark} />
      <mesh position={[0, 1.62, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 1.7, 8]} />
        <meshStandardMaterial color={palette.ink} />
      </mesh>
      {[0.34, 0.55].map((radius) => (
        <mesh key={radius} position={[0, 2.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.025, 5, 20]} />
          <meshBasicMaterial color={palette.ink} />
        </mesh>
      ))}
      <mesh position={[0, 0.87, 0.711]}>
        <planeGeometry args={[1.35, 0.72]} />
        <meshStandardMaterial color={palette.white} />
      </mesh>
      <mesh position={[0, 0.87, 0.725]}>
        <ringGeometry args={[0.19, 0.31, 4]} />
        <meshBasicMaterial color={palette.ink} />
      </mesh>
    </>
  )
}

function TerminalStation() {
  return (
    <>
      <OutlinedBox args={[2.05, 1.55, 1.35]} position={[0, 0.87, 0]} />
      <mesh position={[0, 0.96, 0.686]}>
        <planeGeometry args={[1.55, 0.8]} />
        <meshStandardMaterial color={palette.ink} />
      </mesh>
      <group position={[-0.45, 1.03, 0.7]}>
        <mesh rotation={[0, 0, -0.72]} position={[0, 0.11, 0]}>
          <boxGeometry args={[0.35, 0.08, 0.035]} />
          <meshBasicMaterial color={palette.white} />
        </mesh>
        <mesh rotation={[0, 0, 0.72]} position={[0, -0.11, 0]}>
          <boxGeometry args={[0.35, 0.08, 0.035]} />
          <meshBasicMaterial color={palette.white} />
        </mesh>
        <mesh position={[0.55, -0.2, 0]}>
          <boxGeometry args={[0.42, 0.07, 0.035]} />
          <meshBasicMaterial color={palette.white} />
        </mesh>
      </group>
      <OutlinedBox args={[1.15, 0.22, 0.72]} position={[0, 0.12, 0.18]} color={palette.mid} />
    </>
  )
}

function ConnectionStation() {
  return (
    <>
      <OutlinedBox args={[0.7, 1.9, 0.72]} position={[-0.56, 1.02, 0]} color={palette.white} />
      <OutlinedBox args={[0.7, 1.9, 0.72]} position={[0.56, 1.02, 0]} color={palette.dark} />
      <mesh position={[0, 1.72, 0]} castShadow>
        <boxGeometry args={[0.62, 0.16, 0.18]} />
        <meshStandardMaterial color={palette.ink} />
      </mesh>
      <mesh position={[-0.56, 2.18, 0]} castShadow>
        <sphereGeometry args={[0.24, 12, 8]} />
        <meshStandardMaterial color={palette.ink} />
      </mesh>
      <mesh position={[0.56, 2.18, 0]} castShadow>
        <sphereGeometry args={[0.24, 12, 8]} />
        <meshStandardMaterial color={palette.white} />
      </mesh>
    </>
  )
}

function LabStation() {
  return (
    <>
      <OutlinedBox args={[2.4, 1.35, 1.65]} position={[0, 0.77, 0]} color={palette.white} />
      <mesh position={[-0.62, 1.8, -0.2]} castShadow>
        <cylinderGeometry args={[0.2, 0.26, 1.25, 8]} />
        <meshStandardMaterial color={palette.dark} />
      </mesh>
      <mesh position={[0.62, 1.62, -0.2]} castShadow>
        <cylinderGeometry args={[0.16, 0.22, 0.9, 8]} />
        <meshStandardMaterial color={palette.mid} />
      </mesh>
      <mesh position={[0, 0.82, 0.836]}>
        <planeGeometry args={[1.65, 0.6]} />
        <meshStandardMaterial color={palette.ink} />
      </mesh>
      <group position={[0, 0.84, 0.855]}>
        {[-0.52, -0.18, 0.18, 0.52].map((x) => (
          <mesh key={x} position={[x, 0, 0]}>
            <boxGeometry args={[0.12, 0.34, 0.03]} />
            <meshBasicMaterial color={palette.white} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 1.48, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[1.75, 0.07, 1.45]} />
        <meshStandardMaterial color={palette.ink} />
      </mesh>
    </>
  )
}

const structures = {
  camera: CameraStation,
  broadcast: BroadcastBooth,
  terminal: TerminalStation,
  connection: ConnectionStation,
  lab: LabStation,
}

export default function PointOfInterest({ poi, reducedMotion }) {
  const ringRef = useRef(null)
  const Structure = structures[poi.type]
  const [x, z] = poi.position
  const facingCenter = Math.atan2(-x, -z)

  useFrame((state) => {
    if (!ringRef.current || reducedMotion) return
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.06
    ringRef.current.scale.setScalar(pulse)
    ringRef.current.rotation.z += 0.003
  })

  return (
    <group position={[x, 0, z]} rotation={[0, facingCenter, 0]}>
      <group ref={ringRef} position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <ringGeometry args={[1.24, 1.3, 32]} />
          <meshBasicMaterial color={palette.ink} transparent opacity={0.42} />
        </mesh>
      </group>
      <Structure />
      <Html
        center
        position={[0, poi.type === 'lab' ? 2.72 : 2.82, 0]}
        className="world-label-wrap"
        style={{ pointerEvents: 'none' }}
      >
        <div className="world-label">{poi.label}</div>
      </Html>
    </group>
  )
}
