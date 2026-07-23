import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CustomCursor from './components/CustomCursor'
import ProgressRail from './components/ProgressRail'
import Intro from './sections/Intro'
import Lab from './sections/Lab'
import SocialSpace from './sections/SocialSpace'
import Playground from './sections/Playground'
import EndExperience from './sections/EndExperience'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return undefined

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      wheelMultiplier: 0.9,
    })

    const update = (time) => lenis.raf(time * 1000)
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(update)
      lenis.destroy()
    }
  }, [])

  return (
    <>
      <a className="skip-link" href="#lab">
        Skip intro
      </a>
      <CustomCursor />
      <ProgressRail />
      <main>
        <Intro />
        <Lab />
        <SocialSpace />
        <Playground />
        <EndExperience />
      </main>
    </>
  )
}
