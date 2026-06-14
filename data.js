// ✏️ Edit this file to customize your portfolio
// Add/remove items in any array — pages render automatically

window.portfolioData = {
  person: {
    name: "Your Name",
    initials: "YN",
    role: "Full Stack Developer",
    ageLine: "Full stack developer",
    location: "Your Location",
    status: "Active",
    email: "you@example.com",
    avatar: "https://via.placeholder.com/150",
    avatarAlt: "Your avatar",
    sound: "",
    quote: { text: "Your favorite quote", author: "You" },
    about: [
      "Write a short bio about yourself here.",
      "Add another paragraph about your skills and experience.",
      "Keep it concise and authentic."
    ],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/yourhandle",
        card: { name: "GitHub", cardImage: "" }
      },
      {
        label: "Twitter",
        href: "https://twitter.com/yourhandle",
        card: { name: "Twitter", cardImage: "" }
      },
      {
        label: "LinkedIn",
        href: "https://linkedin.com/in/yourhandle",
        card: { name: "LinkedIn", cardImage: "" }
      },
      {
        label: "Mail",
        href: "mailto:you@example.com",
        card: { name: "Mail", cardImage: "" }
      }
    ]
  },
  stack: [
    { name: "React",    icon: "icons/react.svg" },
    { name: "Next.js",  icon: "icons/nextjs.svg" },
    { name: "Python",   icon: "icons/python.svg" },
    { name: "Node.js",  icon: "icons/nodejs.svg" },
    { name: "Tailwind", icon: "icons/tailwindcss.svg" },
    { name: "MySQL",    icon: "icons/sql.svg" },
    { name: "HTML5",    icon: "icons/html5.svg" },
    { name: "Git",      icon: "icons/git.svg" },
    { name: "JS",       icon: "icons/javascript.svg" },
    { name: "Django",   icon: "icons/django.svg" },
    { name: "PHP",      icon: "icons/php.svg" },
    { name: "Three.js", icon: "icons/threejs.svg" },
    { name: "Supabase", icon: "icons/supabase.svg" }
  ],
  experience: [
    {
      org: "Company Name",
      title: "Job Title",
      type: "Full-time",
      period: "Jan 2020 – Present",
      tags: ["React", "Node.js"],
      points: [
        "Describe your key achievement or responsibility.",
        "Add another accomplishment with measurable impact.",
        "Use active language and keep it concise."
      ]
    },
    {
      org: "Previous Company",
      title: "Previous Role",
      type: "Internship",
      period: "Jun 2019 – Dec 2019",
      tags: ["Python", "SQL"],
      points: [
        "What did you build or contribute to?",
        "What technologies did you use?"
      ]
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
      image: "",
      description: "A short description of your project.",
      tags: ["React", "API"],
      links: [
        { label: "Live link", href: "https://example.com" },
        { label: "GitHub", href: "https://github.com/yourhandle/project" }
      ]
    },
    {
      title: "Project Two",
      subtitle: "Another subtitle",
      status: "Building",
      date: "2025",
      image: "",
      description: "Another project description.",
      tags: ["TypeScript", "Supabase"],
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
      image: "",
      href: "https://medium.com/@yourhandle/post"
    }
  ]
};
