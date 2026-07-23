import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { socials } from '../data/siteData'

export default function SocialSpace() {
  const sectionRef = useRef(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const context = gsap.context(() => {
      if (reducedMotion) return
      gsap.from('.social-link', {
        y: 70,
        opacity: 0,
        duration: 0.9,
        stagger: 0.09,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.social__list',
          start: 'top 76%',
        },
      })
    }, section)

    return () => context.revert()
  }, [])

  const move = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
    event.currentTarget.style.setProperty('--pointer-x', x.toFixed(2))
  }

  return (
    <section className="social" id="social" ref={sectionRef}>
      <div className="social__head">
        <p className="eyebrow">Open channels</p>
        <p>Find me somewhere in the feed.</p>
      </div>
      <div className="social__list">
        {socials.map((social, index) => (
          <a
            className="social-link"
            href={social.href}
            target="_blank"
            rel="noreferrer"
            key={social.platform}
            onPointerMove={move}
          >
            <span className="social-link__index">0{index + 1}</span>
            <span className="social-link__platform">{social.platform}</span>
            <span className="social-link__handle">{social.handle}</span>
            <span className="social-link__arrow" aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
      <div className="social__ticker" aria-hidden="true">
        <div>
          <span>MAKE A MESS / MAKE IT MEAN SOMETHING / </span>
          <span>MAKE A MESS / MAKE IT MEAN SOMETHING / </span>
        </div>
      </div>
    </section>
  )
}
