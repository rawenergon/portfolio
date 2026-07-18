# Portfolio Template

A minimal, customizable portfolio template built with vanilla HTML, CSS, and JavaScript. No frameworks, no build tools — just **fork and edit**.

## ✨ Features

- Dark/light theme with system preference detection
- Single-page application (SPA) routing — no page reloads
- Keyboard command palette (Ctrl+K) for navigation
- Animations powered by GSAP
- Blog, bookmarks, projects, and dashboard pages
- Last.fm Spotify "now playing" widget
- Live status engine
- Fully responsive

## Quick Start

1. **Fork this repo**
2. **Edit `data.js`** — replace all placeholder content with your info
3. **Deploy to Vercel** (free): `npx vercel`

### data.js is your control center

Edit `window.portfolioData` in `data.js` to customize:

| Section | What to change |
|---------|---------------|
| `person` | Your name, bio, avatar, links, quote |
| `stack` | Technologies you use |
| `experience` | Work history |
| `education` | Your education |
| `projects` | Projects you've built |
| `blogs` | Blog posts |

### Customizing further

- Edit `styles.css` for colors, fonts, spacing (CSS custom properties in `:root`)
- Edit individual HTML pages to add/remove sections
- Replace icons in `/icons/` and social images in `/src/`

## Color Themes

The portfolio supports **dark** and **light** modes out of the box. Toggle with the button in the header. Customize colors in `styles.css`:

```css
:root {
  --bg: #050506;
  --text: #f5f5f6;
  --accent: #0ea5ff;
}
[data-theme="light"] {
  --bg: #fafaf9;
  --text: #0c0c0d;
}
```

## File Structure

```
├── index.html       # Main entry point
├── projects.html    # Projects page
├── blog.html        # Blog listing page
├── bookmarks.html   # Bookmarks page
├── dashboard.html   # Dashboard page
├── status.html      # Live status engine
├── spotify.html     # Now-playing widget
├── 404.html         # Custom 404 page
├── styles.css       # All styles
├── client.js        # SPA router + page renderers
├── data.js          # EDIT THIS — your content
├── icons/           # SVG icons and images
└── src/             # Social card images
```

## License

MIT — use it freely, give credit if you like.