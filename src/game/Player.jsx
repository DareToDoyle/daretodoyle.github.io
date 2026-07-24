import { useEffect, useMemo, useRef } from 'react'
import { Edges, RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { moveWithCollisions } from './collision'
import { PLAYER_SPAWN } from '../data/worldData'

const FORWARD = new THREE.Vector3(-1, 0, -1).normalize()
const RIGHT = new THREE.Vector3(1, 0, -1).normalize()
const CAMERA_OFFSET_DESKTOP = new THREE.Vector3(6.7, 7.4, 6.7)
const CAMERA_OFFSET_MOBILE = new THREE.Vector3(7.6, 8.8, 7.6)
const LOOK_OFFSET = new THREE.Vector3(0, 0.9, 0)
const MOVE_SPEED = 3.2

function Character({
  modelRef,
  headRef,
  leftArmRef,
  rightArmRef,
  leftLegRef,
  rightLegRef,
}) {
  return (
    <group ref={modelRef} scale={1.12}>
      <RoundedBox
        args={[0.82, 0.9, 0.58]}
        radius={0.24}
        smoothness={4}
        position={[0, 1.08, 0]}
        castShadow
      >
        <meshToonMaterial color="#e5e5df" />
        <Edges color="#171716" threshold={20} />
      </RoundedBox>

      <mesh position={[0, 1.14, 0.31]} castShadow>
        <circleGeometry args={[0.17, 20]} />
        <meshToonMaterial color="#252524" />
      </mesh>

      <group ref={headRef} position={[0, 1.82, 0]}>
        <mesh position={[0, 0.03, -0.07]} scale={[1.04, 1, 0.98]} castShadow>
          <sphereGeometry args={[0.62, 24, 16]} />
          <meshToonMaterial color="#353533" />
        </mesh>
        <mesh position={[0, -0.03, 0.08]} scale={[0.93, 0.9, 0.92]} castShadow>
          <sphereGeometry args={[0.59, 24, 16]} />
          <meshToonMaterial color="#f5f5f0" />
        </mesh>

        <mesh position={[-0.2, 0.02, 0.59]}>
          <sphereGeometry args={[0.055, 10, 8]} />
          <meshBasicMaterial color="#171716" />
        </mesh>
        <mesh position={[0.2, 0.02, 0.59]}>
          <sphereGeometry args={[0.055, 10, 8]} />
          <meshBasicMaterial color="#171716" />
        </mesh>
        <mesh position={[0, -0.1, 0.62]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.055, 0.11, 8]} />
          <meshToonMaterial color="#a1a19b" />
        </mesh>
        <mesh position={[0, -0.25, 0.585]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.085, 0.014, 5, 16, Math.PI]} />
          <meshBasicMaterial color="#171716" />
        </mesh>

        <mesh position={[0, 0.52, 0.03]} rotation={[0.08, 0, 0]} castShadow>
          <cylinderGeometry args={[0.47, 0.56, 0.24, 24]} />
          <meshToonMaterial color="#20201f" />
        </mesh>
        <mesh position={[0, 0.55, 0.34]} rotation={[0.25, 0, 0]} castShadow>
          <boxGeometry args={[0.58, 0.08, 0.34]} />
          <meshToonMaterial color="#20201f" />
        </mesh>
      </group>

      <group ref={leftArmRef} position={[-0.53, 1.3, 0]}>
        <mesh position={[0, -0.27, 0]} castShadow>
          <capsuleGeometry args={[0.13, 0.36, 6, 10]} />
          <meshToonMaterial color="#686864" />
        </mesh>
        <mesh position={[0, -0.55, 0]} castShadow>
          <sphereGeometry args={[0.16, 12, 8]} />
          <meshToonMaterial color="#f2f2ed" />
        </mesh>
      </group>
      <group ref={rightArmRef} position={[0.53, 1.3, 0]}>
        <mesh position={[0, -0.27, 0]} castShadow>
          <capsuleGeometry args={[0.13, 0.36, 6, 10]} />
          <meshToonMaterial color="#686864" />
        </mesh>
        <mesh position={[0, -0.55, 0]} castShadow>
          <sphereGeometry args={[0.16, 12, 8]} />
          <meshToonMaterial color="#f2f2ed" />
        </mesh>
      </group>

      <group ref={leftLegRef} position={[-0.22, 0.72, 0]}>
        <mesh position={[0, -0.31, 0]} castShadow>
          <capsuleGeometry args={[0.15, 0.3, 6, 10]} />
          <meshToonMaterial color="#292928" />
        </mesh>
        <RoundedBox args={[0.31, 0.2, 0.47]} radius={0.08} smoothness={2} position={[0, -0.61, 0.08]} castShadow>
          <meshToonMaterial color="#171716" />
        </RoundedBox>
      </group>
      <group ref={rightLegRef} position={[0.22, 0.72, 0]}>
        <mesh position={[0, -0.31, 0]} castShadow>
          <capsuleGeometry args={[0.15, 0.3, 6, 10]} />
          <meshToonMaterial color="#292928" />
        </mesh>
        <RoundedBox args={[0.31, 0.2, 0.47]} radius={0.08} smoothness={2} position={[0, -0.61, 0.08]} castShadow>
          <meshToonMaterial color="#171716" />
        </RoundedBox>
      </group>
    </group>
  )
}

export default function Player({
  pois,
  colliders,
  bounds,
  controllerRef,
  paused,
  onInteract,
  onMove,
  isMobile,
  reducedMotion,
}) {
  const rootRef = useRef(null)
  const modelRef = useRef(null)
  const headRef = useRef(null)
  const leftArmRef = useRef(null)
  const rightArmRef = useRef(null)
  const leftLegRef = useRef(null)
  const rightLegRef = useRef(null)
  const keysRef = useRef(new Set())
  const velocityRef = useRef(new THREE.Vector3())
  const walkPhaseRef = useRef(0)
  const previousPoiRef = useRef(null)
  const movedRef = useRef(false)
  const desiredDirection = useMemo(() => new THREE.Vector3(), [])
  const displacement = useMemo(() => new THREE.Vector3(), [])
  const scratch = useMemo(() => new THREE.Vector3(), [])
  const cameraPosition = useMemo(() => new THREE.Vector3(), [])
  const cameraTarget = useMemo(() => new THREE.Vector3(...PLAYER_SPAWN), [])

  useEffect(() => {
    const movementKeys = new Set([
      'KeyW',
      'KeyA',
      'KeyS',
      'KeyD',
      'ArrowUp',
      'ArrowLeft',
      'ArrowDown',
      'ArrowRight',
    ])

    const down = (event) => {
      if (!movementKeys.has(event.code)) return
      event.preventDefault()
      keysRef.current.add(event.code)
      if (!movedRef.current) {
        movedRef.current = true
        onMove()
      }
    }
    const up = (event) => {
      if (!movementKeys.has(event.code)) return
      event.preventDefault()
      keysRef.current.delete(event.code)
    }
    const clear = () => {
      keysRef.current.clear()
      controllerRef.current.active = false
      velocityRef.current.set(0, 0, 0)
    }

    window.addEventListener('keydown', down, { passive: false })
    window.addEventListener('keyup', up, { passive: false })
    window.addEventListener('blur', clear)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', clear)
    }
  }, [controllerRef, onMove])

  useFrame((state, rawDelta) => {
    const root = rootRef.current
    if (!root) return

    const delta = Math.min(rawDelta, 0.05)
    const velocity = velocityRef.current
    desiredDirection.set(0, 0, 0)

    if (!paused) {
      const keys = keysRef.current
      const forwardInput =
        Number(keys.has('KeyW') || keys.has('ArrowUp')) -
        Number(keys.has('KeyS') || keys.has('ArrowDown'))
      const rightInput =
        Number(keys.has('KeyD') || keys.has('ArrowRight')) -
        Number(keys.has('KeyA') || keys.has('ArrowLeft'))

      if (forwardInput || rightInput) {
        desiredDirection.addScaledVector(FORWARD, forwardInput)
        desiredDirection.addScaledVector(RIGHT, rightInput)
      } else if (controllerRef.current.active) {
        desiredDirection.subVectors(controllerRef.current.point, root.position)
        desiredDirection.y = 0
        if (desiredDirection.lengthSq() < 0.035) desiredDirection.set(0, 0, 0)
      }
    }

    if (desiredDirection.lengthSq() > 0) {
      desiredDirection.normalize()
      velocity.copy(desiredDirection).multiplyScalar(MOVE_SPEED)
      displacement.copy(velocity).multiplyScalar(delta)
      const collision = moveWithCollisions(root.position, displacement, colliders, bounds, scratch)
      if (collision.blockedX) velocity.x = 0
      if (collision.blockedZ) velocity.z = 0
    } else {
      // Mouse/touch release is an immediate stop, not destination coasting.
      velocity.set(0, 0, 0)
    }

    const speed = Math.hypot(velocity.x, velocity.z)
    if (speed > 0.04) {
      const desiredAngle = Math.atan2(velocity.x, velocity.z)
      const angleDelta = Math.atan2(
        Math.sin(desiredAngle - root.rotation.y),
        Math.cos(desiredAngle - root.rotation.y),
      )
      root.rotation.y += angleDelta * (1 - Math.exp(-14 * delta))
    }

    const walkAmount = Math.min(speed / MOVE_SPEED, 1)
    if (!reducedMotion && walkAmount > 0) {
      walkPhaseRef.current += delta * (8.5 + speed * 0.75)
    }
    const stride = reducedMotion ? 0 : Math.sin(walkPhaseRef.current) * 0.58 * walkAmount
    const idle = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 2.1)

    if (leftLegRef.current) leftLegRef.current.rotation.x = stride
    if (rightLegRef.current) rightLegRef.current.rotation.x = -stride
    if (leftArmRef.current) leftArmRef.current.rotation.x = -stride * 0.72
    if (rightArmRef.current) rightArmRef.current.rotation.x = stride * 0.72
    if (modelRef.current) {
      modelRef.current.position.y =
        Math.abs(Math.sin(walkPhaseRef.current * 2)) * 0.035 * walkAmount +
        idle * 0.009 * (1 - walkAmount)
    }
    if (headRef.current) {
      headRef.current.rotation.z = idle * 0.018 * (1 - walkAmount)
      headRef.current.rotation.x = Math.sin(walkPhaseRef.current * 2) * 0.025 * walkAmount
    }

    const cameraOffset = isMobile ? CAMERA_OFFSET_MOBILE : CAMERA_OFFSET_DESKTOP
    cameraPosition.copy(root.position).add(cameraOffset)
    state.camera.position.lerp(cameraPosition, 1 - Math.exp(-5.2 * delta))
    scratch.copy(root.position).add(LOOK_OFFSET)
    cameraTarget.lerp(scratch, 1 - Math.exp(-6.5 * delta))
    state.camera.lookAt(cameraTarget)

    let nearestPoi = null
    let nearestDistance = Infinity
    for (const poi of pois) {
      const dx = root.position.x - poi.position[0]
      const dz = root.position.z - poi.position[1]
      const distance = Math.hypot(dx, dz)
      if (distance < poi.interactionRadius && distance < nearestDistance) {
        nearestPoi = poi
        nearestDistance = distance
      }
    }

    const nearestId = nearestPoi?.id ?? null
    if (previousPoiRef.current !== nearestId) {
      previousPoiRef.current = nearestId
      onInteract(nearestPoi)
    }
  })

  return (
    <group ref={rootRef} position={PLAYER_SPAWN}>
      <Character
        modelRef={modelRef}
        headRef={headRef}
        leftArmRef={leftArmRef}
        rightArmRef={rightArmRef}
        leftLegRef={leftLegRef}
        rightLegRef={rightLegRef}
      />
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.5, 24]} />
        <meshBasicMaterial color="#111110" transparent opacity={0.2} depthWrite={false} />
      </mesh>
    </group>
  )
}
