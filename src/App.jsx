import { useEffect, useState } from 'react'

import Background from './ui/Background.jsx'
import { validateContact } from './lib/contact.js'

// Files in public/ are not rewritten by Vite, so the base path has to be
// applied by hand or the photo 404s when hosted on a subpath.
//
// The source photo is landscape (3:2), so the markup no longer forces a 4:5
// crop — cropping it here would cut roughly half the frame. A portrait crop is
// kept at public/avatar-portrait.jpg; to use it, point AVATAR at it and put
// back `aspect-4/5 object-cover object-top` on the <img>.
const AVATAR = `${import.meta.env.BASE_URL}avatar.jpg`

const NAME = 'Yuan Kin Ho'
const EMAIL = 'hugoyuan2004@gmail.com'
// Omitting `from=` lets each visitor compose from their own Gmail account.
const GMAIL_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL}`
const PHONE = '+852 9618 5082'
// wa.me wants the number as digits only, no "+".
const WHATSAPP_URL = 'https://wa.me/85296185082'

// The form posts to whatever endpoint is configured at build time. Until one
// exists the form still renders, but tells the visitor to use email/WhatsApp
// instead of silently pretending a message was sent.
const FORM_ENDPOINT = (import.meta.env.VITE_FORM_ENDPOINT ?? '').trim()
const FORM_READY = FORM_ENDPOINT.length > 0
// Honeypot: humans never see this field; a filled value means a bot.
const HONEYPOT = 'company'
// Guards against double-clicks and casual repeat submissions on one device.
const RESUBMIT_COOLDOWN_MS = 60_000

const NAV = [
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
]

const SKILL_GROUPS = [
  {
    group: 'Languages & Frameworks',
    items: ['JavaScript (ES6+)', 'React', 'Vue.js'],
  },
  {
    group: 'Markup & Styling',
    items: ['HTML5', 'CSS3', 'Tailwind CSS'],
  },
  {
    group: 'Tooling',
    items: ['Git', 'Vite', 'GitHub Actions'],
  },
]

const PROJECTS = [
  {
    title: 'Personal Portfolio Site',
    description:
      'Designed and shipped this site end to end — React 19 and Tailwind CSS v4 on Vite, with a dark/light theme, scroll-reveal sections, and an animated backdrop built from a custom canvas particle field.',
    tags: ['React 19', 'Tailwind CSS v4', 'Vite', 'GitHub Actions', 'Canvas'],
    links: [
      { label: 'Live site', href: 'https://pugtox.github.io/kin-ho-profile/' },
      { label: 'Source', href: 'https://github.com/PugtoX/kin-ho-profile' },
    ],
  },
  {
    title: 'Low-Code Platform Evaluation',
    description:
      'Evaluated Mendix and PowerApps for rapid UI prototyping, proposing an integration path with custom React components.',
    tags: ['Mendix', 'PowerApps', 'React', 'Evaluation'],
    links: [],
  },
]

const SECTIONS = [
  { id: 'skills', index: '01', title: 'Skills', kicker: 'What I build with' },
  { id: 'projects', index: '02', title: 'Projects', kicker: 'Selected work' },
  { id: 'contact', index: '03', title: 'Contact', kicker: "Let's talk" },
]

function useReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll('[data-reveal]')

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach((node) => {
        node.dataset.revealed = ''
      })
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.dataset.revealed = ''
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])
}

// Tracks which section owns the viewport so the top-bar link can light up.
function useActiveSection() {
  const [active, setActive] = useState('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.25, 0.5] },
    )

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return active
}

function useTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme ?? 'dark',
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {
      /* private mode: the toggle still works for this session */
    }
  }, [theme])

  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))]
}

function trackSpotlight(event) {
  const box = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty('--mx', `${event.clientX - box.left}px`)
  event.currentTarget.style.setProperty('--my', `${event.clientY - box.top}px`)
}

function Reveal({ children, className = '', delay = 0 }) {
  return (
    <div data-reveal className={className} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

function SectionHeading({ index, title, kicker }) {
  return (
    <Reveal className="mb-12">
      <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">
        {index} — {kicker}
      </p>
      <h2 className="mt-3 flex items-center gap-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
        <span aria-hidden="true" className="h-px w-12 bg-accent/50 sm:w-16" />
      </h2>
      <div className="mt-6 h-px w-full bg-line" />
    </Reveal>
  )
}

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      className="grid size-11 place-items-center rounded-lg border border-line bg-panel text-muted transition-colors hover:border-line-strong hover:text-fg sm:size-9"
    >
      {isDark ? (
        // Shown while dark: the action is "go light".
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
        </svg>
      )}
    </button>
  )
}

function TopBar({ theme, onToggle, active }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-page/75 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <a href="#top" className="group flex items-center gap-2.5">
          <span className="grid size-7 place-items-center rounded-md border border-accent/40 bg-accent-soft font-mono text-[11px] font-bold text-accent">
            YH
          </span>
          <span className="hidden font-mono text-sm text-muted transition-colors group-hover:text-fg sm:inline">
            {NAME.toLowerCase().replaceAll(' ', '.')}
          </span>
        </a>

        <nav className="flex items-center gap-2">
          {NAV.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active === id ? 'true' : undefined}
              className={`rounded-md px-2.5 py-3.5 font-mono text-xs transition-colors sm:px-3 sm:py-1.5 sm:text-[13px] ${
                active === id ? 'bg-accent-soft text-accent' : 'text-muted hover:text-fg'
              }`}
            >
              {label}
            </a>
          ))}
          <div className="ml-1 sm:ml-2">
            <ThemeToggle theme={theme} onToggle={onToggle} />
          </div>
        </nav>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section id="top" className="relative pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="mx-auto grid max-w-5xl items-center gap-14 px-6 lg:grid-cols-[1.4fr_1fr]">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1.5 font-mono text-xs text-muted">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-70" />
              <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
            </span>
            Open to front-end opportunities · Hong Kong
          </p>

          <h1 className="mt-7 text-4xl leading-[1.05] font-semibold tracking-tight sm:text-6xl">
            {NAME}
          </h1>

          <p className="mt-4 font-mono text-sm text-accent sm:text-base">
            Front-End Developer
            <span className="text-muted"> / Applied Sciences @ PolyU SPEED</span>
          </p>

          <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
            I build responsive web interfaces with React and modern JavaScript,
            and I care about the parts users feel but rarely notice — theme
            handled before first paint, animations that respect reduced-motion
            settings, and accessible markup throughout. I work with AI coding
            agents to move faster, while keeping architecture, review and
            testing as my own responsibility. B.Sc. in Applied Sciences (2026),
            after an Associate Degree in Information Technology.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href={WHATSAPP_URL}
              className="rounded-lg bg-accent px-5 py-3 text-sm font-medium text-page transition-transform hover:-translate-y-0.5"
            >
              Get in touch
            </a>
            <a
              href="#projects"
              className="rounded-lg border border-line bg-panel px-5 py-3 text-sm font-medium transition-colors hover:border-line-strong"
            >
              View projects →
            </a>
          </div>
        </Reveal>

        <Reveal delay={120} className="justify-self-center lg:justify-self-end">
          <div className="relative">
            <div className="absolute -inset-3 rounded-3xl bg-accent-soft blur-2xl" />
            <img
              src={AVATAR}
              alt={`Portrait of ${NAME}`}
              width="1264"
              height="844"
              className="relative w-64 rounded-2xl border border-line sm:w-72 lg:w-full lg:max-w-xs"
            />
            <div className="absolute -right-3 -bottom-3 rounded-lg border border-line bg-panel px-3 py-1.5 font-mono text-[11px] text-muted">
              {'{ available: 2026 }'}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Skills() {
  const { index, title, kicker } = SECTIONS[0]

  return (
    <section id="skills" className="scroll-mt-24 py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading index={index} title={title} kicker={kicker} />

        <div className="grid gap-4 md:grid-cols-3">
          {SKILL_GROUPS.map(({ group, items }, i) => (
            <Reveal key={group} delay={i * 90}>
              <div className="h-full rounded-xl border border-line bg-panel p-6 transition-colors hover:border-line-strong">
                <h3 className="font-mono text-xs tracking-wider text-muted uppercase">
                  {group}
                </h3>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {items.map((item) => (
                    <li
                      key={item}
                      className="rounded-md border border-line px-2.5 py-1 font-mono text-xs text-fg/90"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProjectCard({ title, description, tags, links, index }) {
  // Only a card with somewhere to go gets interactive hover feedback.
  const interactive = links.length > 0

  return (
    <article
      onMouseMove={interactive ? trackSpotlight : undefined}
      className={`group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-panel p-6 transition duration-300 hover:border-line-strong sm:p-7 ${
        interactive ? 'spotlight hover:-translate-y-1' : ''
      }`}
    >
      <div className="relative flex items-start justify-between gap-4">
        <h3 className="text-xl font-semibold tracking-tight text-balance transition-colors group-hover:text-accent sm:text-2xl">
          {title}
        </h3>
        <span className="mt-1 shrink-0 font-mono text-xs text-muted">{index}</span>
      </div>

      <p className="relative mt-4 text-sm leading-relaxed text-muted">
        {description}
      </p>

      <ul className="relative mt-6 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <li
            key={tag}
            className="rounded-md border border-line bg-panel-hover px-2.5 py-1 font-mono text-[11px] text-muted"
          >
            {tag}
          </li>
        ))}
      </ul>

      {interactive && (
        <div className="relative mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-6">
          {links.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              title={`${label} — ${title} (opens in a new tab)`}
              className="-my-2 inline-flex items-center gap-1.5 py-2 font-mono text-xs text-muted transition-colors hover:text-accent"
            >
              {label}
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      )}
    </article>
  )
}

function Projects() {
  const { index, title, kicker } = SECTIONS[1]

  return (
    <section id="projects" className="scroll-mt-24 py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading index={index} title={title} kicker={kicker} />

        <div className="grid gap-4 md:grid-cols-2">
          {PROJECTS.map((project, i) => (
            <Reveal key={project.title} delay={i * 90}>
              <ProjectCard {...project} index={`0${i + 1}`} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// Client-side validation only keeps the obvious junk out — the endpoint is the
// real gate, so nothing here is treated as proof that a message arrives.
// The rules live in ./lib/contact.js so they can be tested directly.

function ContactForm() {
  const [values, setValues] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent | error | throttled

  function setField(field, value) {
    setValues((v) => ({ ...v, [field]: value }))
    // Clear only the field being edited; other errors stay visible.
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    // Honeypot: report success so a bot does not learn it was filtered.
    const trap = new FormData(event.currentTarget).get(HONEYPOT)
    if (typeof trap === 'string' && trap.trim()) {
      setStatus('sent')
      return
    }

    const found = validateContact(values)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    const last = Number(localStorage.getItem('contactSentAt') ?? 0)
    if (Date.now() - last < RESUBMIT_COOLDOWN_MS) {
      setStatus('throttled')
      return
    }

    setStatus('sending')
    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ ...values, [HONEYPOT]: '' }),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      localStorage.setItem('contactSentAt', String(Date.now()))
      setStatus('sent')
      setValues({ name: '', email: '', message: '' })
    } catch {
      // Never leave the visitor thinking it worked when it did not.
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="border-b border-line p-6 sm:p-8">
        <p className="text-sm text-fg" role="status">
          Thanks — your message is on its way. I usually reply within a day.
        </p>
        <p className="mt-2 text-sm text-muted">
          If you hear nothing, email me directly at{' '}
          <a className="underline hover:text-accent" href={GMAIL_URL}>
            {EMAIL}
          </a>
          .
        </p>
      </div>
    )
  }

  const fieldClass =
    'mt-2 w-full rounded-lg border border-line bg-page px-3 py-2.5 text-sm text-fg outline-none transition-colors placeholder:text-muted focus:border-accent'

  return (
    <form className="border-b border-line p-6 sm:p-8" onSubmit={handleSubmit} noValidate>
      {!FORM_READY && (
        <p className="mb-6 rounded-lg border border-line bg-panel-hover p-3 text-xs text-muted">
          The form is not wired up yet on this deployment — please use the email or
          WhatsApp links below and they will reach me.
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="font-mono text-xs tracking-wider text-muted uppercase" htmlFor="cf-name">
            Name
          </label>
          <input
            id="cf-name"
            name="name"
            className={fieldClass}
            value={values.name}
            onChange={(e) => setField('name', e.target.value)}
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={errors.name ? 'cf-name-error' : undefined}
            autoComplete="name"
          />
          {errors.name && (
            <p id="cf-name-error" className="mt-2 text-xs text-accent">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label className="font-mono text-xs tracking-wider text-muted uppercase" htmlFor="cf-email">
            Email
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            className={fieldClass}
            value={values.email}
            onChange={(e) => setField('email', e.target.value)}
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={errors.email ? 'cf-email-error' : undefined}
            autoComplete="email"
          />
          {errors.email && (
            <p id="cf-email-error" className="mt-2 text-xs text-accent">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <label className="font-mono text-xs tracking-wider text-muted uppercase" htmlFor="cf-message">
          Message
        </label>
        <textarea
          id="cf-message"
          name="message"
          rows={5}
          className={`${fieldClass} resize-y`}
          value={values.message}
          onChange={(e) => setField('message', e.target.value)}
          aria-invalid={errors.message ? 'true' : undefined}
          aria-describedby={errors.message ? 'cf-message-error' : undefined}
        />
        {errors.message && (
          <p id="cf-message-error" className="mt-2 text-xs text-accent">
            {errors.message}
          </p>
        )}
      </div>

      {/* Honeypot — hidden from humans, left for bots to fill. */}
      <div className="absolute h-px w-px overflow-hidden opacity-0" aria-hidden="true">
        <label htmlFor="cf-company">Company</label>
        <input id="cf-company" name={HONEYPOT} tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="rounded-lg bg-accent px-5 py-3 text-sm font-medium text-page transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
        >
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>

        {status === 'error' && (
          <p className="text-xs text-accent" role="alert">
            The message could not be sent. Please use email or WhatsApp below.
          </p>
        )}
        {status === 'throttled' && (
          <p className="text-xs text-muted" role="status">
            Already sent — give it a minute, or use email below.
          </p>
        )}
      </div>
    </form>
  )
}

function Contact() {
  const { index, title, kicker } = SECTIONS[2]
  const links = [
    { label: 'Email', value: EMAIL, href: GMAIL_URL },
    { label: 'WhatsApp', value: PHONE, href: WHATSAPP_URL },
  ]

  return (
    <section id="contact" className="scroll-mt-24 py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading index={index} title={title} kicker={kicker} />

        <Reveal>
          <div className="overflow-hidden rounded-xl border border-line bg-panel">
            <div className="border-b border-line p-6 sm:p-8">
              <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Available for freelance front-end work.
              </h3>
              <p className="mt-2 text-sm text-muted">
                Based in Hong Kong — Cantonese (native), Mandarin (advanced),
                English (intermediate).
              </p>
            </div>

            <ContactForm />

            <dl className="grid sm:grid-cols-2">
              {links.map(({ label, value, href }) => (
                // The <a> wraps the pair, so a <div> has to wrap the <dt>/<dd>
                // group: <dl> only accepts dt/dd/div as direct children, and
                // axe flags the list (and the items) without it.
                <a
                  key={label}
                  href={href}
                  className="group block border-b border-line transition-colors hover:bg-panel-hover sm:border-r sm:border-b-0 sm:last:border-r-0"
                >
                  <div className="flex items-center justify-between gap-4 p-6 sm:p-7">
                    <div>
                      <dt className="font-mono text-xs tracking-wider text-muted uppercase">
                        {label}
                      </dt>
                      <dd className="mt-2 text-sm break-all transition-colors group-hover:text-accent sm:text-base">
                        {value}
                      </dd>
                    </div>
                    <span className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent">
                      →
                    </span>
                  </div>
                </a>
              ))}
            </dl>
          </div>
        </Reveal>

        <Reveal delay={110}>
          <footer className="mt-10 text-center font-mono text-xs text-muted">
            Built with React, Vite and Tailwind CSS
          </footer>
        </Reveal>
      </div>
    </section>
  )
}

export default function App() {
  const [theme, toggleTheme] = useTheme()
  const active = useActiveSection()
  useReveal()

  return (
    <div className="min-h-screen">
      <Background theme={theme} />
      <TopBar theme={theme} onToggle={toggleTheme} active={active} />
      <main>
        <Hero />
        <Skills />
        <Projects />
        <Contact />
      </main>
    </div>
  )
}
