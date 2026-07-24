import { useEffect, useMemo } from 'react'
import { Edges, RoundedBox, useTexture } from '@react-three/drei'
import * as THREE from 'three'

const palette = {
  ink: '#171716',
  charcoal: '#30302e',
  dark: '#575753',
  mid: '#999993',
  light: '#e4e4de',
  white: '#f7f7f2',
}

function ToonBox({ args, color = palette.light, radius = 0.08, children, ...props }) {
  return (
    <RoundedBox args={args} radius={radius} smoothness={3} castShadow receiveShadow {...props}>
      <meshToonMaterial color={color} />
      <Edges color={palette.ink} threshold={20} />
      {children}
    </RoundedBox>
  )
}

function useSignTexture(label) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 256
    const context = canvas.getContext('2d')
    context.fillStyle = '#f3f3ed'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.strokeStyle = '#171716'
    context.lineWidth = 22
    context.strokeRect(11, 11, canvas.width - 22, canvas.height - 22)
    context.fillStyle = '#171716'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.font = '900 116px monospace'
    const measured = context.measureText(label.toUpperCase()).width
    const scale = Math.min(1, 850 / measured)
    context.save()
    context.translate(canvas.width / 2, canvas.height / 2 + 4)
    context.scale(scale, 1)
    context.fillText(label.toUpperCase(), 0, 0)
    context.restore()

    const nextTexture = new THREE.CanvasTexture(canvas)
    nextTexture.colorSpace = THREE.SRGBColorSpace
    nextTexture.minFilter = THREE.LinearFilter
    nextTexture.magFilter = THREE.LinearFilter
    nextTexture.generateMipmaps = true
    return nextTexture
  }, [label])

  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

function PhysicalSign({ label, position = [0, 2.5, 0.84], width = 2.2 }) {
  const texture = useSignTexture(label)
  return (
    <group position={position}>
      <ToonBox args={[width, 0.62, 0.12]} color={palette.white} radius={0.05} />
      <mesh position={[0, 0, 0.066]}>
        <planeGeometry args={[width - 0.12, 0.5]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.066]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[width - 0.12, 0.5]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {[-width * 0.32, width * 0.32].map((x) => (
        <mesh key={x} position={[x, -0.48, -0.02]} castShadow>
          <boxGeometry args={[0.08, 0.62, 0.08]} />
          <meshToonMaterial color={palette.ink} />
        </mesh>
      ))}
    </group>
  )
}

function HouseShell({ color = palette.light, roofColor = palette.charcoal, width = 2.7, depth = 2.05 }) {
  return (
    <>
      <ToonBox args={[width, 1.75, depth]} position={[0, 0.95, 0]} color={color} radius={0.14} />
      <mesh position={[0, 2.02, -0.03]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[width * 0.72, 0.85, 4]} />
        <meshToonMaterial color={roofColor} />
      </mesh>
      <ToonBox args={[0.78, 1.25, 0.12]} position={[0, 0.66, depth / 2 + 0.065]} color={palette.ink} radius={0.05} />
    </>
  )
}

function PhotoStudio({ label }) {
  return (
    <group>
      <HouseShell color={palette.white} roofColor={palette.mid} />
      <PhysicalSign label={label} position={[0, 2.72, 0.76]} />
      <mesh position={[-0.76, 1.25, 1.1]} castShadow>
        <boxGeometry args={[0.54, 0.54, 0.16]} />
        <meshToonMaterial color={palette.ink} />
      </mesh>
      <mesh position={[-0.76, 1.25, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.12, 16]} />
        <meshToonMaterial color={palette.white} />
      </mesh>
      <group position={[1.02, 0.55, 1.35]} rotation={[0, -0.16, 0]}>
        <ToonBox args={[0.75, 1.0, 0.12]} color={palette.white} radius={0.04} />
        <mesh position={[0, 0, 0.068]}>
          <planeGeometry args={[0.55, 0.72]} />
          <meshToonMaterial color={palette.dark} />
        </mesh>
      </group>
    </group>
  )
}

function BroadcastStudio({ label }) {
  return (
    <group>
      <HouseShell color={palette.dark} roofColor={palette.ink} width={2.85} depth={2.15} />
      <PhysicalSign label={label} position={[0, 2.72, 0.8]} />
      <mesh position={[0.88, 2.72, -0.28]} castShadow>
        <cylinderGeometry args={[0.055, 0.075, 2.1, 10]} />
        <meshToonMaterial color={palette.ink} />
      </mesh>
      {[0.25, 0.42].map((radius) => (
        <mesh key={radius} position={[0.88, 3.72, -0.28]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.025, 6, 24]} />
          <meshBasicMaterial color={palette.white} />
        </mesh>
      ))}
      <group position={[-0.87, 1.22, 1.14]}>
        <ToonBox args={[0.75, 0.58, 0.14]} color={palette.white} radius={0.04} />
        <mesh position={[0, 0, 0.076]}>
          <circleGeometry args={[0.15, 3]} />
          <meshBasicMaterial color={palette.ink} />
        </mesh>
      </group>
    </group>
  )
}

function CodeWorkshop({ label }) {
  return (
    <group>
      <HouseShell color={palette.light} roofColor={palette.charcoal} width={2.9} depth={2.1} />
      <PhysicalSign label={label} position={[0, 2.72, 0.8]} />
      <group position={[-0.9, 1.15, 1.12]}>
        <ToonBox args={[0.68, 0.58, 0.1]} color={palette.ink} radius={0.03} />
        {[-0.16, 0, 0.16].map((y, index) => (
          <mesh key={y} position={[index === 1 ? 0.08 : -0.08, y, 0.058]}>
            <boxGeometry args={[index === 1 ? 0.35 : 0.22, 0.035, 0.02]} />
            <meshBasicMaterial color={palette.white} />
          </mesh>
        ))}
      </group>
      {[0, 1].map((index) => (
        <group key={index} position={[1.7 + index * 0.48, 0, 0.62 - index * 0.42]}>
          <ToonBox args={[0.48, 0.48, 0.48]} position={[0, 0.25, 0]} color={index ? palette.mid : palette.white} />
          <Edges color={palette.ink} />
        </group>
      ))}
    </group>
  )
}

function Office({ label }) {
  return (
    <group>
      <ToonBox args={[2.85, 1.9, 2.05]} position={[0, 1.02, 0]} color={palette.white} radius={0.12} />
      <ToonBox args={[3.15, 0.28, 2.3]} position={[0, 2.08, 0]} color={palette.charcoal} radius={0.08} />
      <PhysicalSign label={label} position={[0, 2.62, 0.82]} />
      {[-0.92, 0.92].map((x) => (
        <group key={x}>
          <mesh position={[x, 1.03, 1.12]} castShadow>
            <cylinderGeometry args={[0.13, 0.18, 1.7, 12]} />
            <meshToonMaterial color={palette.mid} />
          </mesh>
          <mesh position={[x, 1.26, 1.22]}>
            <planeGeometry args={[0.42, 0.6]} />
            <meshToonMaterial color={palette.dark} />
          </mesh>
        </group>
      ))}
      {[0.22, 0.44].map((z, index) => (
        <ToonBox
          key={z}
          args={[1.25 + index * 0.35, 0.16, 0.38]}
          position={[0, 0.08 + index * 0.12, 1.23 + z]}
          color={index ? palette.mid : palette.light}
          radius={0.03}
        />
      ))}
    </group>
  )
}

function LabWorkshop({ label }) {
  const logo = useTexture(`${import.meta.env.BASE_URL}logo.png`)
  logo.colorSpace = THREE.SRGBColorSpace

  return (
    <group>
      <ToonBox args={[3.5, 2.0, 2.5]} position={[0, 1.05, 0]} color={palette.light} radius={0.16} />
      <ToonBox args={[3.85, 0.34, 2.82]} position={[0, 2.18, 0]} color={palette.ink} radius={0.08} />
      <PhysicalSign label={label} position={[0, 2.82, 0.98]} width={2.55} />
      <ToonBox args={[1.78, 1.55, 0.12]} position={[0, 0.83, 1.31]} color={palette.ink} radius={0.03} />
      <mesh position={[0, 1.06, 1.385]}>
        <planeGeometry args={[1.05, 0.7]} />
        <meshBasicMaterial map={logo} toneMapped={false} />
      </mesh>
      <group position={[-1.32, 0.35, 1.53]}>
        <ToonBox args={[0.72, 0.68, 0.72]} color={palette.mid} />
        <mesh position={[0, 0.02, 0.37]}>
          <boxGeometry args={[0.38, 0.08, 0.025]} />
          <meshBasicMaterial color={palette.ink} />
        </mesh>
      </group>
      <group position={[1.32, 0.4, 1.46]}>
        <mesh position={[0, 0.42, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.18, 0.85, 12]} />
          <meshToonMaterial color={palette.dark} />
        </mesh>
        <mesh position={[0, 0.95, 0]} castShadow>
          <sphereGeometry args={[0.24, 16, 12]} />
          <meshToonMaterial color={palette.white} />
        </mesh>
      </group>
    </group>
  )
}

const structures = {
  camera: PhotoStudio,
  broadcast: BroadcastStudio,
  terminal: CodeWorkshop,
  connection: Office,
  lab: LabWorkshop,
}

export default function PointOfInterest({ poi }) {
  const Structure = structures[poi.type]
  const [x, z] = poi.position
  const facingCenter = Math.atan2(-x, -z)

  return (
    <group position={[x, 0.08, z]} rotation={[0, facingCenter, 0]}>
      <mesh position={[0, 0.015, 0]} receiveShadow>
        <cylinderGeometry args={[2.05, 2.16, 0.14, 12]} />
        <meshToonMaterial color="#c6c6c0" />
      </mesh>
      <Structure label={poi.label} />
    </group>
  )
}
