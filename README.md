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
    location: "Your Location",
    email: "you@example.com",
    avatar: "https://example.com/avatar.png",
    quote: { text: "Your favorite quote", author: "You" },
    about: [
      "Write a short bio about yourself here.",
      "Add another paragraph about your skills and experience."
    ],
    links: [
      { label: "GitHub", href: "https://github.com/yourhandle",
        card: { name: "GitHub", cardImage: "src/github.png" } },
      { label: "Twitter", href: "https://twitter.com/yourhandle",
        card: { name: "Twitter", cardImage: "src/x.png" } }
    ]
  },
  stack: [
    { name: "React", icon: "icons/react.svg" },
    { name: "Node.js", icon: "icons/nodejs.svg" }
  ],
  experience: [
    {
      org: "Company Name",
      title: "Job Title",
      type: "Full-time",
      period: "Jan 2020 – Present",
      tags: ["React", "Node.js"],
      points: ["Describe your key achievement here."]
    }
  ],
  education: [
    {
      org: "University Name",
      title: "Degree",
      field: "Major",
      period: "2018 – 2022",
      icon: "https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/graduation-cap.svg"
    }
  ],
  projects: [
    {
      title: "Project One",
      subtitle: "Short subtitle",
      status: "Live",
      date: "2025",
      image: "https://example.com/project.png",
      description: "A short description of your project.",
      tags: ["React", "API"],
      links: [
        { label: "Live link", href: "https://example.com" },
        { label: "GitHub", href: "https://github.com/yourhandle/project" }
      ]
    }
  ],
  blogs: [
    {
      title: "Getting Started",
      description: "Write about your first blog post topic.",
      date: "01/01/2025",
      tags: ["development", "thoughts"],
      image: "https://example.com/blog.png",
      href: "https://medium.com/@yourhandle/post"
    }
  ]
};
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

### Live Status (via GitHub Gist)

The status badge on the home page pulls from a **GitHub Gist**.

**Setup:**

1. Go to [gist.github.com](https://gist.github.com)
2. Create a new **public** gist named `status.txt`
3. Add your daily schedule — each line is a time range:
   ```
   08:00-12:00 | 💼 | Working on projects
   12:00-13:00 | 🍽️ | Lunch break
   13:00-17:00 | 💻 | Coding
   17:00-22:00 | 🎮 | Gaming / Free
   ```
4. Click "Create public gist"
5. Click the **Raw** button and copy the URL
6. In `client.js`, replace:
   ```js
   const STATUS_GIST = "https://gist.githubusercontent.com/YOUR_USER/YOUR_GIST_ID/raw/status.txt";
   ```

> ⏰ The status automatically switches based on your local time. If no range matches, it shows "Idle".

### Bookmarks (via GitHub Gist)

The bookmarks page loads from a **GitHub Gist** — perfect for syncing across devices.

**Setup:**

1. Go to [gist.github.com](https://gist.github.com)
2. Create a new **public** gist (name doesn't matter)
3. Add your bookmarks in this JSON format:
   ```json
   {
     "categories": [
       {
         "title": "Design Tools",
         "links": [
           { "name": "Figma", "url": "https://figma.com" },
           { "name": "Unsplash", "url": "https://unsplash.com" }
         ]
       },
       {
         "title": "Developer",
         "links": [
           { "name": "GitHub", "url": "https://github.com" },
           { "name": "MDN", "url": "https://developer.mozilla.org" }
         ]
       }
     ]
   }
   ```
4. Click "Create public gist"
5. Copy the **gist ID** from the URL (`https://gist.github.com/youruser/`**THIS_PART**)
6. In `client.js`, update:
   ```js
   const BOOKMARKS_GIST = "YOUR_GIST_ID";
   ```

### View Counter

Replace `yourname` in the CountAPI URL in `client.js`:
```js
const res = await fetch(`https://api.countapi.xyz/${ep}/yourname/portfolio`);
```

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
