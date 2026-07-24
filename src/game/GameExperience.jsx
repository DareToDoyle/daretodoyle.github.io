import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import Player from './Player'
import World from './World'
import { pois } from '../data/pois'
import { PLAYER_SPAWN, sceneryColliders, WORLD_BOUNDS } from '../data/worldData'

function ReadySignal({ onReady }) {
  useEffect(() => {
    onReady()
  }, [onReady])
  return null
}

function GameScene({ paused, onInteract, onMove, onReady, isMobile, reducedMotion }) {
  const targetRef = useRef(null)
  const playerPositionRef = useRef(new THREE.Vector3(...PLAYER_SPAWN))
  const colliders = useMemo(
    () => [
      ...sceneryColliders,
      ...pois.map((poi) => ({
        type: 'circle',
        x: poi.position[0],
        z: poi.position[1],
        radius: poi.collisionRadius,
      })),
    ],
    [],
  )

  return (
    <Suspense fallback={null}>
      <World
        pois={pois}
        targetRef={targetRef}
        paused={paused}
        onMoveIntent={onMove}
        reducedMotion={reducedMotion}
      />
      <Player
        pois={pois}
        colliders={colliders}
        bounds={WORLD_BOUNDS}
        targetRef={targetRef}
        playerPositionRef={playerPositionRef}
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
      dpr={isMobile ? 1 : [1, 1.5]}
      camera={{
        position: isMobile ? [11, 13.5, 11] : [8.8, 10.5, 8.8],
        zoom: isMobile ? 35 : 55,
        near: 0.1,
        far: 80,
      }}
      gl={{
        antialias: !isMobile,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.08
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
