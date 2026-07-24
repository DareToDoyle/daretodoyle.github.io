import { externalPois } from '../data/pois'

export default function FallbackPage() {
  return (
    <main className="fallback">
      <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Dare to Doyle" />
      <p>DARE TO DOYLE</p>
      <h1>A tiny world,<br />currently out of range.</h1>
      <p className="fallback__note">
        This browser could not start WebGL. The important destinations are still open.
      </p>
      <nav aria-label="Dare to Doyle links">
        {externalPois.map((poi) => (
          <a key={poi.id} href={poi.url} target="_blank" rel="noreferrer">
            <span>{poi.label}</span>
            <span>{poi.handle} ↗</span>
          </a>
        ))}
      </nav>
    </main>
  )
}
