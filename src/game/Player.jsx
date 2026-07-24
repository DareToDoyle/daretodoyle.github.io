import { useEffect, useMemo, useRef } from 'react'
import { Edges, RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { isPositionBlocked } from './collision'
import { PLAYER_SPAWN } from '../data/worldData'

const FORWARD = new THREE.Vector3(-1, 0, -1).normalize()
const RIGHT = new THREE.Vector3(1, 0, -1).normalize()
const CAMERA_OFFSET_DESKTOP = new THREE.Vector3(8.8, 10.5, 8.8)
const CAMERA_OFFSET_MOBILE = new THREE.Vector3(11, 13.5, 11)
const LOOK_OFFSET = new THREE.Vector3(0, 0.75, 0)

function Character({ bodyRef, headRef, leftArmRef, rightArmRef, leftLegRef, rightLegRef }) {
  return (
    <group>
      <group ref={bodyRef}>
        <RoundedBox args={[0.72, 0.82, 0.52]} radius={0.18} smoothness={2} position={[0, 0.9, 0]} castShadow>
          <meshStandardMaterial color="#ededE8" roughness={0.9} />
          <Edges color="#171716" threshold={18} />
        </RoundedBox>

        <group ref={headRef} position={[0, 1.58, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.48, 14, 10]} />
            <meshStandardMaterial color="#f8f8f4" roughness={0.88} flatShading />
          </mesh>
          <mesh position={[-0.16, 0.05, 0.44]}>
            <sphereGeometry args={[0.045, 7, 5]} />
            <meshBasicMaterial color="#171716" />
          </mesh>
          <mesh position={[0.16, 0.05, 0.44]}>
            <sphereGeometry args={[0.045, 7, 5]} />
            <meshBasicMaterial color="#171716" />
          </mesh>
          <mesh position={[0, -0.12, 0.46]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.08, 0.018, 4, 10, Math.PI]} />
            <meshBasicMaterial color="#171716" />
          </mesh>
        </group>

        <group ref={leftArmRef} position={[-0.48, 1.1, 0]}>
          <mesh position={[0, -0.25, 0]} castShadow>
            <capsuleGeometry args={[0.11, 0.38, 4, 7]} />
            <meshStandardMaterial color="#5b5b57" roughness={0.9} />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.48, 1.1, 0]}>
          <mesh position={[0, -0.25, 0]} castShadow>
            <capsuleGeometry args={[0.11, 0.38, 4, 7]} />
            <meshStandardMaterial color="#5b5b57" roughness={0.9} />
          </mesh>
        </group>

        <group ref={leftLegRef} position={[-0.2, 0.58, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <capsuleGeometry args={[0.13, 0.36, 4, 7]} />
            <meshStandardMaterial color="#242423" roughness={0.95} />
          </mesh>
        </group>
        <group ref={rightLegRef} position={[0.2, 0.58, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <capsuleGeometry args={[0.13, 0.36, 4, 7]} />
            <meshStandardMaterial color="#242423" roughness={0.95} />
          </mesh>
        </group>
      </group>

      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.46, 20]} />
        <meshBasicMaterial color="#111110" transparent opacity={0.16} depthWrite={false} />
      </mesh>
    </group>
  )
}

export default function Player({
  pois,
  colliders,
  bounds,
  targetRef,
  playerPositionRef,
  paused,
  onInteract,
  onMove,
  isMobile,
  reducedMotion,
}) {
  const rootRef = useRef(null)
  const bodyRef = useRef(null)
  const headRef = useRef(null)
  const leftArmRef = useRef(null)
  const rightArmRef = useRef(null)
  const leftLegRef = useRef(null)
  const rightLegRef = useRef(null)
  const keysRef = useRef(new Set())
  const velocityRef = useRef(new THREE.Vector3())
  const desiredDirection = useMemo(() => new THREE.Vector3(), [])
  const desiredVelocity = useMemo(() => new THREE.Vector3(), [])
  const candidate = useMemo(() => new THREE.Vector3(), [])
  const cameraTarget = useMemo(() => new THREE.Vector3(...PLAYER_SPAWN), [])
  const lastNearRef = useRef(null)
  const movedRef = useRef(false)

  useEffect(() => {
    const movementKeys = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'])
    const down = (event) => {
      if (!movementKeys.has(event.code)) return
      event.preventDefault()
      keysRef.current.add(event.code)
      targetRef.current = null
      if (!movedRef.current) {
        movedRef.current = true
        onMove()
      }
    }
    const up = (event) => {
      if (movementKeys.has(event.code)) keysRef.current.delete(event.code)
    }
    const clear = () => keysRef.current.clear()

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', clear)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', clear)
    }
  }, [onMove, targetRef])

  useFrame((state, rawDelta) => {
    const root = rootRef.current
    if (!root) return

    const delta = Math.min(rawDelta, 0.05)
    const velocity = velocityRef.current
    desiredDirection.set(0, 0, 0)

    if (!paused) {
      const keys = keysRef.current
      const forwardInput = Number(keys.has('KeyW') || keys.has('ArrowUp')) - Number(keys.has('KeyS') || keys.has('ArrowDown'))
      const rightInput = Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft'))

      if (forwardInput || rightInput) {
        desiredDirection.addScaledVector(FORWARD, forwardInput)
        desiredDirection.addScaledVector(RIGHT, rightInput)
        desiredDirection.normalize()
      } else if (targetRef.current) {
        desiredDirection.subVectors(targetRef.current, root.position)
        desiredDirection.y = 0
        const distance = desiredDirection.length()
        if (distance > 0.14) {
          desiredDirection.normalize()
        } else {
          desiredDirection.set(0, 0, 0)
          targetRef.current = null
        }
      }
    }

    const moving = desiredDirection.lengthSq() > 0
    desiredVelocity.copy(desiredDirection).multiplyScalar(3.15)
    const response = moving ? 9 : 12
    velocity.lerp(desiredVelocity, 1 - Math.exp(-response * delta))

    if (paused) {
      velocity.lerp(desiredVelocity.set(0, 0, 0), 1 - Math.exp(-16 * delta))
      targetRef.current = null
    }

    candidate.copy(root.position)
    candidate.x += velocity.x * delta
    if (!isPositionBlocked(candidate, colliders, bounds)) {
      root.position.x = candidate.x
    } else {
      velocity.x *= 0.18
    }

    candidate.copy(root.position)
    candidate.z += velocity.z * delta
    if (!isPositionBlocked(candidate, colliders, bounds)) {
      root.position.z = candidate.z
    } else {
      velocity.z *= 0.18
    }

    const speed = velocity.length()
    if (speed > 0.08) {
      const desiredAngle = Math.atan2(velocity.x, velocity.z)
      const difference = Math.atan2(Math.sin(desiredAngle - root.rotation.y), Math.cos(desiredAngle - root.rotation.y))
      root.rotation.y += difference * (1 - Math.exp(-12 * delta))
    }

    const elapsed = state.clock.elapsedTime
    const walkAmount = Math.min(speed / 2.4, 1)
    const stride = reducedMotion ? 0 : Math.sin(elapsed * 10) * 0.62 * walkAmount
    if (leftLegRef.current) leftLegRef.current.rotation.x = stride
    if (rightLegRef.current) rightLegRef.current.rotation.x = -stride
    if (leftArmRef.current) leftArmRef.current.rotation.x = -stride * 0.72
    if (rightArmRef.current) rightArmRef.current.rotation.x = stride * 0.72
    if (bodyRef.current) bodyRef.current.position.y = reducedMotion ? 0 : Math.abs(Math.sin(elapsed * 10)) * 0.035 * walkAmount
    if (headRef.current && !reducedMotion) headRef.current.rotation.z = Math.sin(elapsed * 1.7) * 0.018 * (1 - walkAmount)

    playerPositionRef.current.copy(root.position)

    const cameraOffset = isMobile ? CAMERA_OFFSET_MOBILE : CAMERA_OFFSET_DESKTOP
    candidate.copy(root.position).add(cameraOffset)
    state.camera.position.lerp(candidate, 1 - Math.exp(-3.8 * delta))
    cameraTarget.lerp(candidate.copy(root.position).add(LOOK_OFFSET), 1 - Math.exp(-5 * delta))
    state.camera.lookAt(cameraTarget)

    if (!paused) {
      let nearby = null
      let nearestDistance = Infinity
      for (const poi of pois) {
        const dx = root.position.x - poi.position[0]
        const dz = root.position.z - poi.position[1]
        const distance = Math.sqrt(dx * dx + dz * dz)
        if (distance < poi.interactionRadius && distance < nearestDistance) {
          nearby = poi
          nearestDistance = distance
        }
      }

      if (nearby && lastNearRef.current !== nearby.id) {
        lastNearRef.current = nearby.id
        velocity.set(0, 0, 0)
        targetRef.current = null
        onInteract(nearby)
      } else if (!nearby) {
        lastNearRef.current = null
      }
    }
  })

  return (
    <group ref={rootRef} position={PLAYER_SPAWN}>
      <Character
        bodyRef={bodyRef}
        headRef={headRef}
        leftArmRef={leftArmRef}
        rightArmRef={rightArmRef}
        leftLegRef={leftLegRef}
        rightLegRef={rightLegRef}
      />
    </group>
  )
}
