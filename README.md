# DoyleOS

DoyleOS is a dependency-free, Windows 98-inspired personal link hub for `daretodoyle.com`. It is a creative website, not an authentication service or Microsoft product.

## Run locally

Open `index.html` directly, or serve this directory with any static file server. No install or build step is required.

## Edit content and destinations

All owner-editable labels, descriptions, CTA text, destination URLs, branding, and login timings live in `config.js`.

- Destination URLs intentionally default to `null`. A null destination renders a disabled **Link coming soon** button.
- Use exact `https://` URLs, or a validated `mailto:` URL for Contact.
- Never add credentials or secrets; `config.js` is public.
- Adjust the values under `login` to change the intro timing.

## Deployment

This is a static site consisting of `index.html`, `styles.css`, `config.js`, `doyleos.js`, and `favicon.svg`. Deploy the repository root using the existing static-host configuration. Preserve the canonical domain and any provider-side DNS settings. No DNS or domain changes are required by DoyleOS.

## Reference policy

Concept images and historical screenshots are design references only. They are not used, copied, hotlinked, or deployed by this implementation. The interface and small icons are built with original HTML/CSS.
