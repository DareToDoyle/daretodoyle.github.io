import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

export default function LoadingScreen({ reducedMotion }) {
  const overlayRef = useRef(null)

  useLayoutEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return undefined

    const context = gsap.context(() => {
      gsap.fromTo('.loading__progress i', { scaleX: 0 }, {
        scaleX: 0.82,
        duration: reducedMotion ? 0 : 1.8,
        ease: 'power2.out',
      })
      if (!reducedMotion) {
        gsap.from('.loading__logo', { scale: 0.88, opacity: 0, duration: 0.8, ease: 'power3.out' })
      }
    }, overlay)
    return () => context.revert()
  }, [reducedMotion])

  return (
    <div
      className="loading"
      ref={overlayRef}
      aria-live="polite"
      aria-label="Loading Dare to Doyle world"
    >
      <div className="loading__index">
        <span>D2D / WORLD</span>
        <span>LOADING</span>
      </div>
      <img className="loading__logo" src={`${import.meta.env.BASE_URL}logo.png`} alt="Dare to Doyle" />
      <div className="loading__progress" aria-hidden="true"><i /></div>
      <p>Building somewhere to explore.</p>
    </div>
  )
}
