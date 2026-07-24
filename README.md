# Dare to Doyle — Pixel Village

**Dare to Doyle** is a fully static personal website presented as a compact
monochrome pixel-art RPG village. Visitors guide an original character through a
handcrafted world to find social destinations and the internal D2D Lab.

The experience has no backend, database, paid service, external tileset,
external model, or runtime content service.

## Features

- Phaser Canvas game inside a lightweight React shell
- Compact 80×56 map — exactly half the tile area of the previous 112×80 village
- Asymmetric routes, civic plaza, small clearings, gardens, pond, and layered
  forest boundary
- Eighteen deterministic ground variants covering grass, paths, plaza, garden,
  forest, water, and collision
- Four distinct tree silhouettes, three bush shapes, and original village,
  nature, photography, broadcast, workshop, office, and lab props
- Five structurally distinct POI buildings
- Dynamically measured physical pixel signs using a crisp 5×7 glyph system
- Separate building origins, doorway interaction points, and tight interaction
  radii for every POI
- Higher-detail 20×28 player sprite with four-direction idle and walking frames
- WASD and arrow-key movement
- Held mouse or touch movement with live drag steering and immediate release
- Phaser Arcade Physics for forest, buildings, fences, monument, and large rocks
- Continuous physics movement with a shared integer-snapped player/camera render
  anchor for stable pixel-art scrolling
- Integer browser scaling, nearest-neighbour rendering, and responsive portrait
  and landscape layouts
- Data-driven external and internal points of interest
- Non-blocking proximity dialogue that dismisses when the player leaves
- Internal D2D Lab project list
- Existing `logo.png` converted into a pixel-style central plaza monument at
  runtime
- Reduced-motion support and keyboard/screen-reader direct links
- GitHub Pages deployment with custom-domain support

## Local development

Node.js 20.19+ or Node.js 22.12+ is recommended.

```bash
npm install
npm run dev
```

Vite prints the local URL, normally `http://localhost:5173`.

Add `?debug` to the local URL to display building origins, doorway interaction
points, and interaction radii. Debug rendering is development-only and is not
enabled in production.

## Production build

```bash
npm run build
npm run preview
```

The static production output is written to `dist/`.

## Controls

Desktop:

- Use `WASD` or the arrow keys to walk.
- Press and hold the left mouse button to move relative to the pointer.
- Drag while holding to steer.
- Release to stop immediately.

Mobile:

- Touch and hold to move.
- Slide the held finger to steer.
- Lift the finger to stop immediately.

Walking onto the visible entrance point of a destination shows its contextual
panel. Movement remains active while the panel is visible, and walking away
dismisses it automatically.

## Editing destinations

Points of interest live in [`src/data/pois.js`](src/data/pois.js). Each entry
defines its:

- ID, name, copy, handle, and URL;
- building position and architecture type;
- physical sign offset;
- explicit doorway interaction point and radius;
- external or internal behaviour.

The village dimensions, deterministic ground variation, handcrafted routes,
forest boundary, scenery clusters, collision objects, and player spawn live in
[`src/data/villageData.js`](src/data/villageData.js).

Procedural pixel tiles, 5×7 text, signs, sprite frames, distinct buildings,
props, and the logo conversion live in
[`src/game/pixelAssets.js`](src/game/pixelAssets.js).

## Project structure

```text
src/
  components/      Loading, HUD, dialogue, and fallback UI
  data/            POI and handcrafted tile-world configuration
  game/            Phaser setup, village scene, and pixel asset generation
  styles/          Active pixel-game interface styling
  App.jsx
  main.jsx
public/
  logo.png         Original Dare to Doyle logo
```

Previous implementations are retained outside the active source tree:

- `_archive/3d-version/` — useful source from the former React Three Fiber world
- `_archive/previous-site/` — the earlier scrolling website
- `_archive/previous-2d-map/` — a Git-history restore point for the first Phaser
  village

Nothing under `_archive/` is imported by or bundled into production.

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` installs dependencies, builds the
Vite app, copies the root `CNAME` into `dist/`, and deploys the artifact.

In GitHub:

1. Open **Settings → Pages**.
2. Set **Source** to **GitHub Actions**.
3. Push to `main`, or manually run **Deploy Vite site to GitHub Pages** from the
   Actions tab.

Vite uses relative production asset paths, so the build works on account-level
Pages domains and repository subpaths. The custom domain remains configured
through the root `CNAME`.
