import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

export default function InteractionDialog({ poi, onClose, reducedMotion }) {
  const dialogRef = useRef(null)
  const closeRef = useRef(null)

  useLayoutEffect(() => {
    if (!poi || !dialogRef.current) return undefined
    const context = gsap.context(() => {
      gsap.fromTo(dialogRef.current, {
        y: reducedMotion ? 0 : 42,
        opacity: 0,
        scale: reducedMotion ? 1 : 0.97,
      }, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: reducedMotion ? 0.01 : 0.48,
        ease: 'power3.out',
      })
    }, dialogRef)
    closeRef.current?.focus({ preventScroll: true })
    return () => context.revert()
  }, [poi, reducedMotion])

  useEffect(() => {
    if (!poi) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [poi, onClose])

  if (!poi) return null

  return (
    <div className="dialog-layer">
      <section
        className="interaction-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <div className="interaction-dialog__topline">
          <span>Destination discovered</span>
          <span>{poi.id.toUpperCase()} / D2D</span>
        </div>

        <div className="interaction-dialog__content">
          <p className="interaction-dialog__kicker">{poi.handle}</p>
          <h2 id="dialog-title">{poi.label}</h2>
          <p id="dialog-description">{poi.subtitle}</p>
        </div>

        {poi.mode === 'internal' && (
          <div className="lab-list">
            {poi.projects.map((project) => (
              <div key={project.id}>
                <span>{project.id}</span>
                <strong>{project.title}</strong>
                <em>{project.state}</em>
              </div>
            ))}
          </div>
        )}

        <div className="interaction-dialog__actions">
          {poi.mode === 'external' && (
            <a href={poi.url} target="_blank" rel="noreferrer" onClick={onClose}>
              Visit <span aria-hidden="true">↗</span>
            </a>
          )}
          <button type="button" onClick={onClose} ref={closeRef}>
            {poi.mode === 'internal' ? 'Back to world' : 'Close'}
          </button>
        </div>
      </section>
    </div>
  )
}
