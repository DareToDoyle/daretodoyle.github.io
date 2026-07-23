import { lazy, Suspense, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const CoreScene = lazy(() => import('../three/CoreScene'))

export default function Intro() {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const scrollProgress = useRef(0)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const context = gsap.context(() => {
      if (reducedMotion) {
        gsap.set('.intro__word-inner, .intro__meta, .intro__phrase, .scroll-cue', {
          clearProps: 'all',
        })
        return
      }

      const entrance = gsap.timeline({ defaults: { ease: 'power4.out' } })
      entrance
        .from('.intro__word-inner', { yPercent: 115, duration: 1.25, stagger: 0.09 })
        .from('.intro__visual', { scale: 0.72, opacity: 0, duration: 1.4 }, 0.18)
        .from('.intro__meta, .intro__phrase, .scroll-cue', {
          y: 18,
          opacity: 0,
          duration: 0.8,
          stagger: 0.08,
        }, 0.55)

      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=125%',
          pin: stage,
          scrub: 1,
          onUpdate: (self) => {
            scrollProgress.current = self.progress
          },
        },
      })
        .to('.intro__word--one', { xPercent: -12, opacity: 0.2, ease: 'none' }, 0)
        .to('.intro__word--two', { xPercent: 13, opacity: 0.2, ease: 'none' }, 0)
        .to('.intro__word--three', { xPercent: -7, opacity: 0.04, ease: 'none' }, 0)
        .to('.intro__visual', { scale: 1.6, opacity: 0, ease: 'power2.in' }, 0.2)
        .to('.intro__phrase, .scroll-cue, .intro__meta', { opacity: 0, ease: 'none' }, 0)
        .fromTo('.intro__exit', { yPercent: 100 }, { yPercent: 0, ease: 'none' }, 0.52)
    }, section)

    return () => context.revert()
  }, [])

  return (
    <section className="intro" id="intro" ref={sectionRef}>
      <div className="intro__stage" ref={stageRef}>
        <div className="intro__meta">
          <span>Independent signal</span>
          <span>51.50° N / 0.12° W</span>
        </div>

        <div className="intro__visual" aria-hidden="true">
          <Suspense fallback={<div className="scene-fallback" />}>
            <CoreScene scrollProgress={scrollProgress} />
          </Suspense>
        </div>

        <h1 className="intro__title" aria-label="Dare to Doyle">
          <span className="intro__word intro__word--one"><span className="intro__word-inner">Dare</span></span>
          <span className="intro__word intro__word--two"><span className="intro__word-inner">to</span></span>
          <span className="intro__word intro__word--three"><span className="intro__word-inner">Doyle</span></span>
        </h1>

        <p className="intro__phrase">build <i /> break <i /> create</p>
        <div className="scroll-cue" aria-hidden="true">
          <span>Scroll to enter</span>
          <b />
        </div>

        <div className="intro__exit" aria-hidden="true">
          <span>Ideas need somewhere to misbehave.</span>
        </div>
      </div>
    </section>
  )
}
