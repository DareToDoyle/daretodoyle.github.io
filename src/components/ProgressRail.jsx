import { useEffect, useState } from 'react'

const sections = ['intro', 'lab', 'social', 'playground', 'end']

export default function ProgressRail() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(sections.indexOf(visible.target.id))
      },
      { threshold: [0.2, 0.45, 0.7] },
    )

    sections.forEach((id) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div className="corner-mark" aria-hidden="true">
        <span>D/2D</span>
        <span>Digital playground</span>
      </div>
      <div className="progress-rail" aria-hidden="true">
        <span>{String(active + 1).padStart(2, '0')}</span>
        <i>
          <b style={{ transform: `scaleY(${(active + 1) / sections.length})` }} />
        </i>
        <span>{String(sections.length).padStart(2, '0')}</span>
      </div>
    </>
  )
}
