<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0D1117&height=200&section=header&text=PORTFOLIO&fontSize=60&fontColor=FFFFFF&animation=fadeIn" width="100%"/>
</div>

<h3 align="center">✨ A minimal, customizable portfolio template ✨</h3>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-000?style=for-the-badge&logo=html5&logoColor=white"/>
  <img src="https://img.shields.io/badge/CSS3-000?style=for-the-badge&logo=css3&logoColor=white"/>
  <img src="https://img.shields.io/badge/JavaScript-000?style=for-the-badge&logo=javascript&logoColor=white"/>
  <img src="https://img.shields.io/badge/GSAP-000?style=for-the-badge&logo=greensock&logoColor=white"/>
  <img src="https://img.shields.io/badge/License-MIT-000?style=for-the-badge"/>
</p>

<p align="center">
  Zero frameworks. Zero build tools. Zero config.<br>
  Just vanilla HTML, CSS, and JS — <b>fork and go</b>.
</p>

---

## 🚀 Quick Start

```bash
# Fork the repo
# Then clone YOUR fork
git clone https://github.com/YOUR_USERNAME/portfolio.git
cd portfolio

# Open it — that's it
open index.html
# or
start index.html   # Windows
```

---

## ✏️ Customize

All content lives in one file — **`data.js`**:

```js
window.portfolioData = {
  person: {
    name: "Your Name",
    initials: "YN",
    role: "Full Stack Developer",
    // ...
  },
  projects: [ /* add your projects */ ],
  blogs: [ /* add your blog posts */ ],
  // ...
}
```

| Field | Description |
|---|---|
| `person.name` | Your display name |
| `person.initials` | Logo text (2-3 chars) |
| `person.avatar` | Profile image URL |
| `person.links` | Social links with hover cards |
| `stack` | Tech stack icons (name + svg path) |
| `projects` | Project cards with links and tags |
| `blogs` | Blog post cards |
| `experience` | Work history accordion |
| `education` | Education entries |

Home page shows the **first 2 projects & blogs**. Add more — they appear on `/projects` and `/blog` pages with search.

---

## 🧩 Features

| | |
|---|---|
| 🌗 **Dark/Light theme** | Persists, no flash |
| 🔍 **Command palette** | `Ctrl+K` to navigate & toggle theme |
| 📱 **Responsive** | Hamburger nav on mobile |
| 🎵 **Last.fm widget** | Shows currently playing track |
| 📊 **Visitor counter** | CountAPI + fallback |
| 🐍 **GitHub graph** | Contribution grid |
| 🔎 **Search** | Real-time project & blog search |
| 🎨 **Canvas noise** | Subtle grain overlay |

---

## ⚙️ Optional Integrations

### Last.fm
In `client.js`, replace:
```js
const lastFmApiKey = "YOUR_LASTFM_API_KEY";
const lastFmUser = "YOUR_LASTFM_USERNAME";
```

### GitHub Contributions
```js
// Replace with your GitHub username
fetch("https://github-contributions-api.jogruber.de/v4/YOUR_USERNAME?y=2026")
```

### Live Status
Create a [GitHub Gist](https://gist.github.com) with your schedule:
```
08:00-12:00 | 💼 | Working
12:00-13:00 | 🍽️ | Lunch break
```
Then update the `STATUS_GIST` URL in `client.js`.

### View Counter
Replace `yourname` in the CountAPI URL in `client.js`.

---

## 🗂️ Structure

```
portfolio/
├── index.html          # Home page
├── projects.html       # Projects page
├── blog.html           # Blog page
├── bookmarks.html      # Bookmarks page
├── styles.css          # All styles
├── client.js           # All logic
├── data.js             # Your content — edit this!
├── icons/              # SVG icons
├── src/                # Images, audio
└── vercel.json         # Deploy config (optional)
```

---

## 🌐 Deploy on Vercel

[![Deploy to Vercel](https://img.shields.io/badge/Deploy-000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/portfolio)

1. Push your fork to GitHub
2. Import to [Vercel](https://vercel.com/new)
3. Done — your portfolio is live

---

## 📄 License

MIT — free to use, modify, and share.

---

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0D1117&height=120&section=footer"/>
  <br>
  <sub>Built with 🖤 for the open source community</sub>
</div>
