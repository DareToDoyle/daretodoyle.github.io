import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import LoadingScreen from './components/LoadingScreen'
import InteractionDialog from './components/InteractionDialog'
import GameHUD from './components/GameHUD'
import FallbackPage from './components/FallbackPage'
import { externalPois } from './data/pois'

const PhaserGame = lazy(() => import('./game/PhaserGame'))

function canUseCanvas() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('2d'))
  } catch {
    return false
  }
}

class GameErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) return <FallbackPage />
    return this.props.children
  }
}

export default function App() {
  const [selectedPoi, setSelectedPoi] = useState(null)
  const [worldReady, setWorldReady] = useState(false)
  const [loadingComplete, setLoadingComplete] = useState(false)
  const [hasMoved, setHasMoved] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 720px), (pointer: coarse)').matches)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const canvasAvailable = useMemo(canUseCanvas, [])

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 720px), (pointer: coarse)')
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMobile = (event) => setIsMobile(event.matches)
    const updateMotion = (event) => setReducedMotion(event.matches)
    mobileQuery.addEventListener('change', updateMobile)
    motionQuery.addEventListener('change', updateMotion)
    return () => {
      mobileQuery.removeEventListener('change', updateMobile)
      motionQuery.removeEventListener('change', updateMotion)
    }
  }, [])

  useEffect(() => {
    if (!worldReady) return undefined
    const timer = window.setTimeout(() => setLoadingComplete(true), reducedMotion ? 100 : 900)
    return () => window.clearTimeout(timer)
  }, [worldReady, reducedMotion])

  const handleReady = useCallback(() => setWorldReady(true), [])
  const handleMove = useCallback(() => setHasMoved(true), [])
  const closeDialog = useCallback(() => setSelectedPoi(null), [])

  if (!canvasAvailable) return <FallbackPage />

  return (
    <GameErrorBoundary>
      <main className={`game-shell ${loadingComplete ? 'game-shell--ready' : ''}`}>
        <Suspense fallback={null}>
          <PhaserGame
            onPoiChange={setSelectedPoi}
            onMove={handleMove}
            onReady={handleReady}
            reducedMotion={reducedMotion}
          />
        </Suspense>

        <GameHUD hasMoved={hasMoved} isMobile={isMobile} ready={loadingComplete} />
        <InteractionDialog poi={selectedPoi} onClose={closeDialog} reducedMotion={reducedMotion} />
        {!loadingComplete && <LoadingScreen reducedMotion={reducedMotion} />}

        <nav className="accessible-links" aria-label="Direct destination links">
          <span>Direct links</span>
          {externalPois.map((poi) => (
            <a key={poi.id} href={poi.url} target="_blank" rel="noreferrer">
              {poi.label}: {poi.handle}
            </a>
          ))}
        </nav>
      </main>
    </GameErrorBoundary>
  )
}
