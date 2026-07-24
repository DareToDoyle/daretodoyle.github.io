import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects } from '../data/siteData'

gsap.registerPlugin(ScrollTrigger)

export default function Lab() {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const trackRef = useRef(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    const track = trackRef.current
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const context = gsap.context(() => {
      gsap.from('.lab__lead-line span', {
        yPercent: 110,
        duration: reducedMotion ? 0 : 1,
        stagger: reducedMotion ? 0 : 0.08,
        ease: 'power4.out',
        scrollTrigger: reducedMotion ? undefined : {
          trigger: '.lab__lead',
          start: 'top 72%',
        },
      })

      if (reducedMotion) return

      const media = gsap.matchMedia()
      media.add('(min-width: 761px)', () => {
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 64)
        gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: stage,
            start: 'top top',
            end: () => `+=${distance() * 1.08}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })
      })

      return () => media.revert()
    }, section)

    return () => context.revert()
  }, [])

  return (
    <section className="lab" id="lab" ref={sectionRef}>
      <div className="lab__lead">
        <p className="eyebrow">D2D / LAB</p>
        <div className="lab__lead-copy">
          <p className="lab__lead-line"><span>Built to test.</span></p>
          <p className="lab__lead-line lab__lead-line--indent"><span>Allowed to break.</span></p>
        </div>
        <p className="lab__aside">A rolling index of projects, detours, and things without a category.</p>
      </div>

      <div className="lab__stage" ref={stageRef}>
        <div className="lab__stage-label">
          <span>Selected transmissions</span>
          <span>Drag via scroll / 01—03</span>
        </div>
        <div className="lab__track" ref={trackRef}>
          {projects.map((project, index) => (
            <article className={`project project--${project.tone}`} key={project.id} data-cursor>
              <div className="project__topline">
                <span>{project.id}</span>
                <span>0{index + 1}</span>
              </div>
              <div className="project__body">
                <p>{project.status}</p>
                <h2>{project.title}</h2>
                <p className="project__note">{project.note}</p>
              </div>
              <a className="project__action" href={project.href}>
                <span>{project.action}</span>
                <span className="project__arrow" aria-hidden="true">↗</span>
              </a>
              <div className="project__orbit" aria-hidden="true"><i /><i /></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
