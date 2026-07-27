# HBDPleng09082026 — "Thank You for Being Born."

A cinematic, scroll-driven birthday website. No frameworks, no build step —
just HTML5, CSS3, and vanilla JavaScript. Open it and it plays like a short
film: loading stars → intro → countdown → the beginning of a story →
polaroid gallery → favorite things → timeline → a letter → a sky of wishes →
a cake to blow out → a quiet ending.

## Tech stack

Plain HTML5 / CSS3 / vanilla JS only. No React, Vue, Angular, Tailwind,
Bootstrap, Node, or npm are required to **run** this site — see
[Local development](#local-development) below for why a dev tool is still
recommended.

## Project structure

```
birthday-for-note/
├── index.html                 # entry point — loads everything below
├── 404.html                   # themed not-found page
├── assets/
│   ├── css/                   # reset, tokens, global, layout, components, animation, responsive
│   ├── js/                    # utils, loading, scroll, typing, gallery, music, countdown, confetti, wishes, app
│   ├── images/                # hero, childhood, gallery, ending, icons, polaroids
│   ├── music/                 # background.mp3, click.mp3 (see "Adding your own media")
│   ├── fonts/                 # only needed if you self-host fonts instead of Google Fonts
│   └── favicon/
├── sections/                  # one HTML partial per scene, fetched & assembled by app.js
├── data/                      # profile.json, gallery.json, wishes.json — all your editable content
├── docs/                      # prototype notes / screenshots for your own reference
└── .github/workflows/deploy.yml
```

## Editing content (no code required)

Almost everything you'd want to personalize lives in `data/`:

- **`data/profile.json`** — name, birth date, favorite flower/dessert/song/color,
  the timeline entries, the letter paragraphs, and the two closing lines.
- **`data/gallery.json`** — the list of polaroid photos. Point `src` at real
  files you drop into `assets/images/childhood/` or `assets/images/gallery/`.
  Until you do, each polaroid gracefully shows a soft placeholder card instead
  of a broken image.
- **`data/wishes.json`** — the list of short wishes revealed by clicking stars
  in the night-sky scene. Add or remove as many as you like.

## Adding your own media

- **Photos:** drop `.jpg`/`.png` files into `assets/images/gallery/` or
  `assets/images/childhood/`, then reference them from `data/gallery.json`.
- **Music:** add `assets/music/background.mp3` (looping soundtrack) and
  `assets/music/click.mp3` (a soft UI click). The site works perfectly with
  no audio at all — `music.js` fails silently if the files aren't present,
  and the mute button simply has nothing to unmute.
- **Fonts:** the site loads Poppins, Inter, and Kanit from Google Fonts by
  default. If you'd rather self-host, drop `.woff2` files into
  `assets/fonts/` and add `@font-face` rules to the top of
  `assets/css/global.css`.

## Local development

Because scenes and data are loaded with `fetch()` (from `sections/*.html`
and `data/*.json`), opening `index.html` directly from disk (`file://`) will
be blocked by the browser's CORS rules. Serve the folder over `http://`
instead — the simplest options:

**VS Code + Live Server extension**
1. Open the `birthday-for-note` folder in VS Code.
2. Install the "Live Server" extension if you haven't already.
3. Right-click `index.html` → **Open with Live Server**.

**Or, with Python (no install needed on most machines):**
```bash
cd birthday-for-note
python3 -m http.server 5500
```
Then open `http://localhost:5500` in your browser.

## Browser support & accessibility notes

- Built mobile-first; tested breakpoints for iPhone SE, iPhone 13–16,
  Android phones, tablets, and desktop.
- Respects `prefers-reduced-motion`: typewriter effects, confetti, falling
  photos, and the star field all fall back to instant/static states.
- Keyboard accessible: the intro, envelope, and polaroids are all reachable
  and operable with <kbd>Tab</kbd> and <kbd>Enter</kbd>/<kbd>Space</kbd>.
- The "blow the candle" moment offers both a button and an optional
  microphone-based blow detection (falls back to the button if microphone
  access is denied or unavailable).

## Deploying to GitHub Pages

This repo ships with `.github/workflows/deploy.yml`, which deploys the site
automatically using GitHub's official Pages Actions.

1. Push this project to a new GitHub repository:
   ```bash
   cd birthday-for-note
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
2. In your repository on GitHub, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push to `main` (or re-run the workflow from the **Actions** tab) — the
   included workflow will build and publish the site automatically.
5. Your site will be live at `https://<your-username>.github.io/<your-repo>/`.

No build step, secrets, or environment variables are required — the
workflow simply uploads the repository as-is.

## License

MIT — see [`LICENSE`](./LICENSE).
