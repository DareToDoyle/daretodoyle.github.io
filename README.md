# Dare to Doyle — Pixel Village

**Dare to Doyle** is a fully static personal website presented as a small monochrome pixel-art RPG village. Visitors guide an original character through the map to discover social destinations and the internal D2D Lab.

The experience has no backend, database, paid service, external tileset, external model, or runtime content service.

## Features

- Phaser Canvas game inside a lightweight React shell
- 112×80 handcrafted tile map with broad paths and an irregular forest boundary
- Original monochrome tiles, props, buildings, trees, and sprite sheet generated in-repository
- Four-direction idle and walking frames
- WASD and arrow-key movement
- Held mouse or touch movement with live drag steering and immediate release
- Phaser Arcade Physics for forest, building, fence, monument, and large-rock collision
- Pixel-rounded follow camera and integer CSS scaling
- Y-depth sorting for the player, buildings, trees, and scenery
- Data-driven external and internal points of interest
- Non-blocking proximity dialogue that dismisses when the player leaves
- Internal D2D Lab project list
- Existing `logo.png` converted into a pixel-style central plaza monument at runtime
- Responsive portrait and landscape layouts
- Reduced-motion support
- Keyboard/screen-reader direct links and a Canvas fallback
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
- Press and hold the left mouse button to move relative to the pointer.
- Drag while holding to steer.
- Release to stop immediately.

Mobile:

- Touch and hold to move.
- Slide the held finger to steer.
- Lift the finger to stop immediately.

Walking within range of a destination shows its contextual panel. Movement remains active while the panel is visible, and walking away dismisses it automatically.

## Editing destinations

Points of interest live in [`src/data/pois.js`](src/data/pois.js). Each entry defines its:

- ID, name, copy, handle, and URL;
- building and interaction positions;
- interaction radius and type;
- external or internal behavior.

The village dimensions, ground tiles, routes, forest boundary, scenery, collision objects, and player spawn live in [`src/data/villageData.js`](src/data/villageData.js).

Procedural pixel tiles, sprite frames, buildings, props, and the logo conversion are defined in [`src/game/pixelAssets.js`](src/game/pixelAssets.js).

## Project structure

```text
src/
  components/      Loading, HUD, dialogue, and fallback UI
  data/            POI and tile-world configuration
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

Neither archive is bundled into production.

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` installs dependencies, builds the Vite app, copies the root `CNAME` into `dist/`, and deploys the artifact.

In GitHub:

1. Open **Settings → Pages**.
2. Set **Source** to **GitHub Actions**.
3. Push to `main`, or manually run **Deploy Vite site to GitHub Pages** from the Actions tab.

Vite uses relative production asset paths, so the build works on account-level Pages domains and repository subpaths. The custom domain remains configured through the root `CNAME`.
