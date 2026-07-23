import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function CustomCursor() {
  const cursorRef = useRef(null)

  useEffect(() => {
    const cursor = cursorRef.current
    const finePointer = window.matchMedia('(pointer: fine)').matches
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!cursor || !finePointer || reducedMotion) return undefined

    const setX = gsap.quickTo(cursor, 'x', { duration: 0.22, ease: 'power3' })
    const setY = gsap.quickTo(cursor, 'y', { duration: 0.22, ease: 'power3' })

    const move = (event) => {
      setX(event.clientX)
      setY(event.clientY)
      cursor.classList.add('is-visible')
    }

    const detectTarget = (event) => {
      const interactive = event.target.closest('a, button, [data-cursor]')
      cursor.classList.toggle('is-active', Boolean(interactive))
    }

    window.addEventListener('pointermove', move)
    document.addEventListener('pointerover', detectTarget)

    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerover', detectTarget)
    }
  }, [])

  return <div className="cursor" ref={cursorRef} aria-hidden="true"><span /></div>
}
