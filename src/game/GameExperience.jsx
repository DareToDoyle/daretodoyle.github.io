import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import Player from './Player'
import World from './World'
import { pois } from '../data/pois'
import { sceneryColliders, WORLD_BOUNDS } from '../data/worldData'

function ReadySignal({ onReady }) {
  useEffect(() => {
    onReady()
  }, [onReady])
  return null
}

function GameScene({ paused, onInteract, onMove, onReady, isMobile, reducedMotion }) {
  const controllerRef = useRef({
    active: false,
    pointerId: null,
    point: new THREE.Vector3(),
  })
  const colliders = useMemo(
    () => [
      ...sceneryColliders,
      ...pois.map((poi) => ({
        ...poi.collider,
        x: poi.position[0],
        z: poi.position[1],
      })),
    ],
    [],
  )

  return (
    <Suspense fallback={null}>
      <World
        pois={pois}
        controllerRef={controllerRef}
        paused={paused}
        onMoveIntent={onMove}
      />
      <Player
        pois={pois}
        colliders={colliders}
        bounds={WORLD_BOUNDS}
        controllerRef={controllerRef}
        paused={paused}
        onInteract={onInteract}
        onMove={onMove}
        isMobile={isMobile}
        reducedMotion={reducedMotion}
      />
      <ReadySignal onReady={onReady} />
    </Suspense>
  )
}

export default function GameExperience({ paused, onInteract, onMove, onReady, isMobile, reducedMotion }) {
  return (
    <Canvas
      className="game-canvas"
      orthographic
      shadows
      dpr={isMobile ? 1 : [1, 1.35]}
      camera={{
        position: isMobile ? [7.6, 8.8, 7.6] : [6.7, 7.4, 6.7],
        zoom: isMobile ? 70 : 98,
        near: 0.1,
        far: 60,
      }}
      gl={{
        antialias: !isMobile,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace
        gl.toneMapping = THREE.NeutralToneMapping
        gl.toneMappingExposure = 1
      }}
    >
      <GameScene
        paused={paused}
        onInteract={onInteract}
        onMove={onMove}
        onReady={onReady}
        isMobile={isMobile}
        reducedMotion={reducedMotion}
      />
    </Canvas>
  )
}
