import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { socials } from '../data/siteData'

export default function EndExperience() {
  const sectionRef = useRef(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const context = gsap.context(() => {
      if (reducedMotion) return
      gsap.from('.end__word span', {
        yPercent: 120,
        duration: 1.15,
        stagger: 0.06,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 60%',
        },
      })
      gsap.to('.end__disc', {
        rotation: 160,
        yPercent: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: 1,
        },
      })
    }, section)
    return () => context.revert()
  }, [])

  return (
    <section className="end" id="end" ref={sectionRef}>
      <div className="end__disc" aria-hidden="true"><span>D2D</span></div>
      <p className="eyebrow">No finish line</p>
      <div className="end__title" aria-label="Dare to Doyle">
        <div className="end__word"><span>Dare to</span></div>
        <div className="end__word end__word--right"><span>Doyle</span></div>
      </div>
      <p className="end__note"><i /> still building.</p>
      <div className="end__links">
        {socials.slice(0, 3).map((social) => (
          <a href={social.href} target="_blank" rel="noreferrer" key={social.platform}>
            {social.platform}
          </a>
        ))}
      </div>
      <p className="end__copyright">© {new Date().getFullYear()} Dare to Doyle</p>
    </section>
  )
}
