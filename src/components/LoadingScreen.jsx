export default function LoadingScreen({ reducedMotion }) {
  return (
    <div
      className={`loading ${reducedMotion ? 'loading--reduced' : ''}`}
      aria-live="polite"
      aria-label="Loading Dare to Doyle pixel village"
    >
      <div className="loading__index">
        <span>D2D / PIXEL WORLD</span>
        <span>LOADING</span>
      </div>
      <img className="loading__logo" src={`${import.meta.env.BASE_URL}logo.png`} alt="Dare to Doyle" />
      <div className="loading__progress" aria-hidden="true"><i /></div>
      <p>Drawing the village...</p>
    </div>
  )
}
