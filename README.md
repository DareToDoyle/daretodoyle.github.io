# Dare to Doyle — Interactive 3D World

**Dare to Doyle** is a fully static personal website presented as a small monochrome game world. Visitors guide an original character through a toy-like village to find social destinations and the D2D Lab.

The experience has no backend, database, paid service, external model, or runtime content dependency.

## Features

- React, Vite, React Three Fiber, Three.js, Drei, and GSAP
- Original procedural character with idle and speed-linked walking animation
- Keyboard and held-pointer analogue movement
- Touch-and-hold mobile steering
- Swept circle collision with wall sliding and an irregular island boundary
- Smooth close-follow isometric camera
- Data-driven external and internal points of interest
- Physical in-world destination signs generated without external assets
- Compact, non-blocking proximity dialogue that dismisses when the player leaves
- Monochrome toon-style village, trees, paths, gardens, props, and central plaza
- Original `logo.png` used at the plaza and D2D Lab
- Responsive framing and reduced-motion support
- Keyboard/screen-reader direct links and a WebGL fallback
- GitHub Pages deployment with custom-domain support

## Local development

Node.js 20.19+ or Node.js 22.12+ is recommended.

```bash
npm install
npm run dev
```

Vite prints the local URL, normally `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```

The static production output is written to `dist/`.

## Controls

Desktop:

- Use `WASD` or the arrow keys to walk.
- Press and hold the left mouse button on the world to move.
- Drag while holding to steer.
- Release to stop immediately.

Mobile:

- Touch and hold the world to move.
- Slide the held finger to steer.
- Lift the finger to stop immediately.

Walking within range of a destination shows its contextual panel. Movement remains active while the panel is visible, and walking away dismisses it automatically.

## Editing destinations

Points of interest live in [`src/data/pois.js`](src/data/pois.js). Each entry defines its:

- label, copy, handle, and URL;
- world position and structure type;
- interaction radius and collider;
- external or internal interaction mode.

World decoration and matching collision data live in [`src/data/worldData.js`](src/data/worldData.js).

## Project structure

```text
src/
  components/      Loading, HUD, contextual dialogue, and fallback UI
  data/            POI and world configuration
  game/            World, player, destinations, input, and collision
  styles/          Active global game styling
  App.jsx
  main.jsx
public/
  logo.png         Original Dare to Doyle logo
```

The older scrolling site remains under `_archive/previous-site/` for reference and is not included in production.

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` installs dependencies, builds the Vite app, copies the root `CNAME` into `dist/`, and deploys the artifact.

In GitHub:

1. Open **Settings → Pages**.
2. Set **Source** to **GitHub Actions**.
3. Push to `main`, or manually run **Deploy Vite site to GitHub Pages** from the Actions tab.

Vite uses relative production asset paths, so the build works on account-level Pages domains and repository subpaths. The custom domain remains configured through the root `CNAME`.
