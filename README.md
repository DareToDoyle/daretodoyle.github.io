# Dare to Doyle

An experimental personal project hub for **DARE TO DOYLE** — part lab, part social landing page, and part creative playground.

The site is a fully static React/Vite build. GSAP and Lenis drive the page motion, while React Three Fiber renders one lightweight procedural object in the intro. There is no backend, database, paid API, or external 3D model.

## Local development

Node.js 20.19+ or 22.12+ is recommended.

```bash
npm install
npm run dev
```

Vite prints the local development URL in the terminal, usually `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```

The static production site is generated in `dist/`.

## Editing content

- Project entries, social links, and playground labels: `src/data/siteData.js`
- Main page composition: `src/App.jsx`
- Intro, lab, social, playground, and end scenes: `src/sections/`
- Procedural 3D object: `src/three/CoreScene.jsx`
- Colours, typography, layout, and responsive rules: `src/styles/global.css`
- Page title and metadata: `index.html`

The `projects` and `socials` arrays are deliberately separate from the components so new entries can be added without restructuring the presentation.

## GitHub Pages deployment

The workflow at `.github/workflows/deploy.yml` builds and deploys the site whenever `main` is pushed.

1. Push the repository to GitHub.
2. Open **Settings → Pages** in the repository.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push to `main` or run the workflow manually from the **Actions** tab.

Vite uses relative asset paths (`base: './'`), so the build works on both an account-level Pages site and a repository subpath. The existing root `CNAME` is copied into the build for the custom domain.

## Motion and accessibility

The layout adapts to desktop and mobile. Expensive 3D detail is reduced on smaller screens, the custom cursor only appears for fine pointers, and `prefers-reduced-motion` disables smooth scrolling and non-essential motion.
