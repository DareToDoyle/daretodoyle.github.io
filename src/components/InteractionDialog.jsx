import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

export default function InteractionDialog({ poi, onClose, reducedMotion }) {
  const dialogRef = useRef(null)

  useLayoutEffect(() => {
    if (!poi || !dialogRef.current) return undefined
    const context = gsap.context(() => {
      gsap.fromTo(
        dialogRef.current,
        {
          y: reducedMotion ? 0 : 22,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: reducedMotion ? 0.01 : 0.3,
          ease: 'power2.out',
        },
      )
    }, dialogRef)
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
        role="region"
        aria-live="polite"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <div className="interaction-dialog__marker" aria-hidden="true">D2D // {poi.id.toUpperCase()}</div>

        <div className="interaction-dialog__content">
          <p className="interaction-dialog__kicker">You found</p>
          <h2 id="dialog-title">{poi.label}!</h2>
          <p id="dialog-description">{poi.handle} — {poi.subtitle}</p>
        </div>

        {poi.mode === 'internal' && (
          <div className="lab-list" aria-label="Lab projects">
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
          {poi.mode === 'external' ? (
            <a href={poi.url} target="_blank" rel="noreferrer">
              <span aria-hidden="true">▶</span> Visit
            </a>
          ) : (
            <span className="interaction-dialog__soon">Experiments loading soon</span>
          )}
          <button type="button" onClick={onClose}>
            Leave
          </button>
        </div>
      </section>
    </div>
  )
}
