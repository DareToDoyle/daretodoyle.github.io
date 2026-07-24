# Dare to Doyle — Interactive 3D World

**Dare to Doyle** is a fully static, playable personal website built as a compact monochrome 3D diorama. Visitors move an original low-poly character around the map and discover social links and projects as in-world destinations.

The world replaces conventional navigation and scrolling sections. It has no backend, database, paid service, external model, or runtime content dependency.

## Features

- Full-viewport React Three Fiber world
- Original procedural low-poly player with idle and walking motion
- WASD and arrow-key movement
- Click, tap, and click-and-hold movement
- Smooth isometric follow camera
- Lightweight radius and bounding-box collisions
- Data-driven external and internal points of interest
- RPG-style destination dialogue
- Internal D2D Lab project panel
- Responsive mobile camera and touch controls
- Monochrome loading experience using the original `logo.png`
- Reduced-motion treatment
- Keyboard and screen-reader direct-link fallback
- WebGL fallback page
- GitHub Pages deployment workflow

## Local development

Node.js 20.19+ or Node.js 22.12+ is recommended.

```bash
npm install
npm run dev
```

Vite will print the local URL, normally `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```

The static production output is written to `dist/`.

## Controls

Desktop:

- `WASD` or arrow keys to walk
- Click on the ground to walk to a location
- Click and hold while moving the pointer to continuously update the destination
- `Escape` closes an open interaction

Mobile:

- Tap the ground to walk
- Tap and hold, then drag, for continuous movement

Walking into a destination’s proximity area opens its interaction automatically.

## Editing destinations

All points of interest are defined in [`src/data/pois.js`](src/data/pois.js). Each entry contains:

- display label and copy;
- URL or internal interaction mode;
- world position;
- structure type;
- interaction and collision radiuses.

Adding a destination does not require changing player movement or dialogue logic.

World decoration and collision data are in [`src/data/worldData.js`](src/data/worldData.js).

## Project structure

```text
src/
  components/      Loading, HUD, dialogue, and fallback UI
  data/            POI and world configuration
  game/            World, player, POI structures, and collisions
  styles/          Active global game styling
  App.jsx
  main.jsx
public/
  logo.png         Original Dare to Doyle logo
```

The previous scrolling site is retained only for reference in `_archive/previous-site/`. It is outside `src/` and is not bundled.

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` installs dependencies, builds the Vite app, copies the root `CNAME` into `dist/`, and deploys the artifact.

In GitHub:

1. Open **Settings → Pages**.
2. Set **Source** to **GitHub Actions**.
3. Push to `main`, or manually run **Deploy Vite site to GitHub Pages** from the Actions tab.

Vite uses relative production asset paths, so the build works on account-level Pages domains and repository subpaths. The custom domain remains configured through the preserved root `CNAME`.
