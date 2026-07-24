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
        <span>D2D</span>
        <p>Dare to Doyle<br />Pixel village / 002</p>
      </div>

      <div className="world-status">
        <i />
        <span>Village online</span>
      </div>

      <div className={`instructions ${hideInstructions ? 'instructions--hidden' : ''}`}>
        <span>Explore</span>
        <strong>{isMobile ? 'Hold + drag to walk' : 'WASD or hold + drag'}</strong>
        <p>Release to stop. Explore the village to find each place.</p>
      </div>

      <div className="control-legend">
        <span>{isMobile ? 'Hold + steer' : 'W A S D / Hold'}</span>
        <span>Explore</span>
      </div>
    </div>
  )
}
