import { useEffect } from 'react'

export default function InteractionDialog({ poi, onClose, reducedMotion }) {
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
        key={poi.id}
        className={`interaction-dialog ${reducedMotion ? 'interaction-dialog--reduced' : ''}`}
        role="region"
        aria-live="polite"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <div className="interaction-dialog__marker">
          <span>Nearby</span>
          <span>D2D // {poi.id.toUpperCase()}</span>
        </div>

        <div className="interaction-dialog__content">
          <p className="interaction-dialog__kicker">You found</p>
          <h2 id="dialog-title">{poi.label}</h2>
          <p id="dialog-description">{poi.handle}</p>
          <p className="interaction-dialog__description">{poi.subtitle}</p>
        </div>

        {poi.interactionType === 'internal' && (
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
          {poi.interactionType === 'external' ? (
            <a href={poi.url} target="_blank" rel="noreferrer">
              <span aria-hidden="true">▶</span> Visit
            </a>
          ) : (
            <span className="interaction-dialog__soon">Projects loading soon</span>
          )}
          <button type="button" onClick={onClose}>
            Leave
          </button>
        </div>
      </section>
    </div>
  )
}
