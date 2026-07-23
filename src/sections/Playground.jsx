import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { playgroundItems } from '../data/siteData'

export default function Playground() {
  const sectionRef = useRef(null)
  const [phase, setPhase] = useState(1)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const context = gsap.context(() => {
      if (reducedMotion) return
      gsap.from('.play-tile', {
        y: 80,
        opacity: 0,
        rotate: (index) => (index - 1) * 3,
        duration: 1.05,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.playground__deck',
          start: 'top 75%',
        },
      })
    }, section)
    return () => context.revert()
  }, [])

  const trackPointer = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--x', `${event.clientX - bounds.left}px`)
    event.currentTarget.style.setProperty('--y', `${event.clientY - bounds.top}px`)
  }

  return (
    <section className="playground" id="playground" ref={sectionRef}>
      <div className="playground__head">
        <p className="eyebrow">D2D / Playground</p>
        <h2>Small ideas.<br />Room to move.</h2>
        <p>Temporary homes for interactive sketches and browser-sized experiments.</p>
      </div>

      <div className="playground__deck">
        <article className="play-tile play-tile--cursor" onPointerMove={trackPointer} data-cursor>
          <div className="play-tile__meta"><span>{playgroundItems[0].id}</span><span>{playgroundItems[0].mode}</span></div>
          <h3>{playgroundItems[0].name}</h3>
          <div className="play-tile__crosshair" aria-hidden="true"><i /><i /></div>
        </article>

        <button
          className={`play-tile play-tile--visual phase-${phase}`}
          type="button"
          onClick={() => setPhase((current) => (current % 3) + 1)}
        >
          <div className="play-tile__meta"><span>{playgroundItems[1].id}</span><span>{playgroundItems[1].mode}</span></div>
          <h3>{playgroundItems[1].name}</h3>
          <div className="visual-glyph" aria-hidden="true"><i /><i /><i /></div>
          <span className="phase-label">PHASE / 0{phase}</span>
        </button>

        <article className="play-tile play-tile--soon">
          <div className="play-tile__meta"><span>{playgroundItems[2].id}</span><span>{playgroundItems[2].mode}</span></div>
          <h3>{playgroundItems[2].name}</h3>
          <span className="play-tile__question" aria-hidden="true">?</span>
        </article>
      </div>
    </section>
  )
}
