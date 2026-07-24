import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { createVillageScene } from './VillageScene'

function getRenderSize(element) {
  const viewportWidth = Math.max(320, Math.floor(element?.clientWidth || window.innerWidth))
  const viewportHeight = Math.max(320, Math.floor(element?.clientHeight || window.innerHeight))
  const pixelScale = Math.max(2, Math.floor(Math.min(viewportWidth, viewportHeight) / 260))

  return {
    width: Math.floor(viewportWidth / pixelScale),
    height: Math.floor(viewportHeight / pixelScale),
    pixelScale,
  }
}

function sizeCanvas(game, renderSize) {
  game.scale.resize(renderSize.width, renderSize.height)
  game.canvas.style.width = `${renderSize.width * renderSize.pixelScale}px`
  game.canvas.style.height = `${renderSize.height * renderSize.pixelScale}px`
  game.canvas.style.imageRendering = 'pixelated'
}

export default function PhaserGame({
  onReady,
  onMove,
  onPoiChange,
  reducedMotion,
}) {
  const containerRef = useRef(null)
  const gameRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const renderSize = getRenderSize(container)
    const Scene = createVillageScene({
      baseUrl: import.meta.env.BASE_URL,
      onReady,
      onMove,
      onPoiChange,
      reducedMotion,
      debug: import.meta.env.DEV && new URLSearchParams(window.location.search).has('debug'),
    })

    const game = new Phaser.Game({
      type: Phaser.CANVAS,
      parent: container,
      width: renderSize.width,
      height: renderSize.height,
      backgroundColor: '#292927',
      pixelArt: true,
      antialias: false,
      roundPixels: true,
      banner: false,
      audio: {
        noAudio: true,
      },
      render: {
        antialias: false,
        pixelArt: true,
        roundPixels: true,
        transparent: false,
      },
      physics: {
        default: 'arcade',
        arcade: {
          debug: false,
          gravity: { x: 0, y: 0 },
          fps: 60,
        },
      },
      scene: [Scene],
    })
    gameRef.current = game
    sizeCanvas(game, renderSize)

    let resizeTimer
    const observer = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        if (!gameRef.current || !containerRef.current) return
        sizeCanvas(gameRef.current, getRenderSize(containerRef.current))
      }, 120)
    })
    observer.observe(container)

    return () => {
      window.clearTimeout(resizeTimer)
      observer.disconnect()
      game.destroy(true)
      gameRef.current = null
    }
  }, [onMove, onPoiChange, onReady, reducedMotion])

  return (
    <div
      className="phaser-game"
      ref={containerRef}
      aria-label="Interactive Dare to Doyle pixel village"
    />
  )
}
