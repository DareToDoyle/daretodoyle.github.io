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

## Configure Doyle Media Player

The player is controlled entirely by the `mediaPlayer` object in `config.js`.
It does not store a visitor's selected song, playback state, or listening
history.

1. Set `enabled: true` to show the desktop icon and Start > Programs entry.
2. Add, remove, or reorder objects in the `songs` array. Their array order is
   the library and previous/next order.
3. Give every song a unique `id`, then set `defaultTrackId` to the song that
   should load when the player opens.
4. Add the numeric Deezer track ID as `previewId`.
5. Optionally add `artwork`, `year`, and `note`. `artwork` can be a relative
   project path such as `media/song-name.jpg` or an HTTPS image URL. Put local
   artwork in a root `media/` folder; the deployment workflow copies that folder
   automatically when it exists.

Example:

```js
{
  id: 'song1',
  title: 'Song title',
  artist: 'Artist name',
  previewId: '123456789',
  artwork: 'media/song1.jpg',
  year: '2004',
  note: 'Why this one matters to me.'
}
```

`previewId` is the numeric Deezer track ID for the song's 30-second preview.
Invalid or missing preview IDs remain visible as unplayable entries. If
`defaultTrackId` is missing or unplayable, DoyleOS loads
the first valid preview. Playback uses a native audio element and the Web Audio
API, so the record only spins while audio is actually playing and the
visualiser is driven by the real waveform and frequency data. Browser autoplay
rules may still require one press of Play.

Preview URLs are resolved through the public SayaMusicAPI Cloudflare Worker set
in `mediaPlayer.previewApiBase`. It is an external availability dependency; the
project is MIT-licensed and can be self-hosted by replacing that one URL. No API
key belongs in this public configuration file.

## Deployment

This is a static site consisting of `index.html`, `styles.css`, `config.js`,
`doyleos.js`, and `favicon.svg`. No compile step or server runtime is required.

The workflow at `.github/workflows/deploy.yml` publishes those active files to
GitHub Pages whenever `main` is pushed. It also includes the root `CNAME` and
`.nojekyll` files in the deployment artifact. The custom domain is:

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
- `d2d-logo-pixel.svg`
- `green-hills-pixel.png`
- `CNAME`
- `.nojekyll`

The older `app.js` prototype is retained in the repository for now but is not
loaded by `index.html` or included in production.

## Reference policy

Concept images and historical screenshots are design references only. They are not used, copied, hotlinked, or deployed by this implementation. The interface and small icons are built with original HTML/CSS.

## Privacy and analytics

DoyleOS stores desktop icon positions and the visitor's analytics choice in
browser local storage. The fake login does not submit or store credentials.

Google Analytics 4 uses measurement ID `G-NHR1LC4P30`. Its standard tag is
installed directly in the HTML head with Consent Mode defaults set to denied
before the tag loads. **Allow analytics** grants analytics storage;
**Essential only** keeps analytics storage denied. Advertising storage, Google
Signals, and ad-personalisation remain disabled.
Visitors can reopen the choice from **Start > Privacy & Cookies**.

## DoyleOS settings

The Start menu includes a Settings app for wallpaper, dark mode, CRT/pixel
effects, cursor style, and locally displayed system information. Preferences are
stored under `doyleos-settings-v1` in browser local storage. The three included
wallpapers are original DoyleOS artwork. The Green Hills theme is an homage and
does not include Microsoft's Bliss image; its pixel-art bitmap was generated as
an original DoyleOS asset from a user-supplied composition reference.

## Media player privacy

Audio previews and configured cover artwork are requested from Deezer through
the services documented above. DoyleOS does not add player analytics, accounts,
submissions, playlists, playback-history storage, or media-player
cookies/local-storage entries. Closing the app stops its audio and releases its
Web Audio resources; minimising it allows playback to continue.
