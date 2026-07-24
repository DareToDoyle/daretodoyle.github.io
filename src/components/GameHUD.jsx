import { useEffect, useState } from 'react'

export default function GameHUD({ hasMoved, isMobile, ready }) {
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (!ready) return undefined
    const timer = window.setTimeout(() => setTimedOut(true), 6500)
    return () => window.clearTimeout(timer)
  }, [ready])

  const hideInstructions = hasMoved || timedOut

  return (
    <div className="game-ui" aria-hidden="true">
      <div className="world-stamp">
        <span>D/2D</span>
        <p>Dare to Doyle<br />Micro world / 001</p>
      </div>

      <div className="world-status">
        <i />
        <span>World online</span>
      </div>

      <div className={`instructions ${hideInstructions ? 'instructions--hidden' : ''}`}>
        <span>Explore</span>
        <strong>{isMobile ? 'Tap to move' : 'WASD or click to move'}</strong>
        <p>Walk towards a place to discover it.</p>
      </div>

      <div className="control-legend">
        <span>{isMobile ? 'Tap + hold' : 'W A S D'}</span>
        <span>Move</span>
      </div>
    </div>
  )
}
