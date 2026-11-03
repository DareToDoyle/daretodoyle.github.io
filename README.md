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

This is a static site consisting of `index.html`, `styles.css`, `config.js`,
`doyleos.js`, and `favicon.svg`. No compile step or server runtime is required.

The workflow at `.github/workflows/deploy.yml` publishes those active files to
GitHub Pages whenever `main` is pushed. It also includes the root `CNAME` and
`.nojekyll` files in the deployment artifact. The configured custom domain is:

```text
daretodoyle.com
```

In the GitHub repository, **Settings > Pages > Source** must be set to
**GitHub Actions**. Existing DNS records should be preserved; this repository
does not modify DNS. The workflow can also be started manually from the Actions
tab with **Deploy DoyleOS to GitHub Pages > Run workflow**.

## Active production files

Only the following files are copied into the Pages artifact:

- `index.html`
- `styles.css`
- `config.js`
- `doyleos.js`
- `favicon.svg`
- `CNAME`
- `.nojekyll`

The older `app.js` prototype is retained in the repository for now but is not
loaded by `index.html` or included in production.

## Reference policy

Concept images and historical screenshots are design references only. They are not used, copied, hotlinked, or deployed by this implementation. The interface and small icons are built with original HTML/CSS.
