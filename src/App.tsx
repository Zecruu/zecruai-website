import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  CircleHelp,
  CloudDownload,
  Code2,
  Database,
  Download,
  Github,
  HardDrive,
  Layers3,
  LockKeyhole,
  RefreshCcw,
  Sparkles,
  TerminalSquare,
  Workflow,
} from 'lucide-react';
import {
  detectPlatform,
  fetchLatestRelease,
  makeDownloadLink,
  readCachedRelease,
  writeCachedRelease,
  type DownloadLink,
  type GitHubRelease,
  type Platform,
} from './download';

const githubRepoUrl = 'https://github.com/Zecruu/ZecruAgentsHive';
const releasesUrl = 'https://github.com/Zecruu/ZecruAgentsHive/releases/latest';
const licenseUrl = 'https://github.com/Zecruu/ZecruAgentsHive/blob/main/LICENSE';
const contactEmail = 'hello@zecruai.com';

const featureGroups = [
  {
    icon: Workflow,
    title: 'Planner and coder missions',
    body: 'Run a planner agent that delegates concrete missions to coder agents. Keep implementation work parallel without losing a single project-level thread.',
  },
  {
    icon: BrainCircuit,
    title: 'Project memory and distillation',
    body: 'Durable project memory and mission distillation carry decisions, constraints, and learned context forward across long-running agent sessions.',
  },
  {
    icon: TerminalSquare,
    title: 'Use the CLIs you already trust',
    body: 'Works with Claude Code, Codex CLI, and OpenAI-compatible bring-your-own providers. You keep your subscriptions and API keys.',
  },
  {
    icon: RefreshCcw,
    title: 'Always-fresh platform',
    body: 'The desktop app and bundled CLI are built to update cleanly, so agent coordination improvements reach your local workspace quickly.',
  },
  {
    icon: HardDrive,
    title: 'Durable local config',
    body: 'Project mappings and settings are stored locally with atomic writes and backup recovery, designed for update relaunches and daily use.',
  },
  {
    icon: Layers3,
    title: 'Worktree isolation',
    body: 'Coming soon: first-class worktree isolation for parallel agent branches, merge review, and cleaner lifecycle management.',
  },
];

const steps = [
  'A planner turns a goal into an executable mission.',
  'Coder agents claim or receive scoped work, then report progress back through the bus.',
  'Memory, repo maps, and mission summaries keep the next turn grounded.',
];

const screenshotSlots = [
  {
    title: 'Mission canvas',
    path: 'apps/website/public/screens/canvas.png',
    note: 'Drop in the desktop mission/canvas view.',
  },
  {
    title: 'Agent chat',
    path: 'apps/website/public/screens/agent-chat.png',
    note: 'Drop in an active planner/coder chat with usage visible.',
  },
  {
    title: 'Project memory',
    path: 'apps/website/public/screens/project-memory.png',
    note: 'Drop in memory/distillation UI once captured.',
  },
];

function useDownloadLink(): {
  link: DownloadLink;
  loading: boolean;
  fromCache: boolean;
} {
  const platform = useMemo<Platform>(() => detectPlatform(window.navigator.userAgent), []);
  const [release, setRelease] = useState<GitHubRelease | null>(() =>
    readCachedRelease(window.sessionStorage),
  );
  const [loading, setLoading] = useState(!release);
  const [fromCache, setFromCache] = useState(Boolean(release));

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetchLatestRelease(controller.signal)
      .then((latest) => {
        writeCachedRelease(window.sessionStorage, latest);
        setRelease(latest);
        setFromCache(false);
      })
      .catch(() => {
        const cached = readCachedRelease(window.sessionStorage);
        if (cached) {
          setRelease(cached);
          setFromCache(true);
        } else {
          setRelease(null);
          setFromCache(false);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  return {
    link: makeDownloadLink(release, platform),
    loading,
    fromCache,
  };
}

function App() {
  const { link, loading, fromCache } = useDownloadLink();

  return (
    <main className="min-h-screen overflow-hidden bg-ink text-slate-100">
      <header className="border-b border-white/10 bg-ink/92 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="ZecruAI home">
            <img src="./icons/zecruai-icon-64.png" alt="" className="h-9 w-9 rounded-md" />
            <span className="text-lg font-semibold">ZecruAI</span>
          </a>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <a className="nav-link hidden sm:inline-flex" href="#features">
              Features
            </a>
            <a className="nav-link hidden sm:inline-flex" href="#screens">
              Screens
            </a>
            <a className="icon-link" href={githubRepoUrl} aria-label="GitHub repository">
              <Github className="h-5 w-5" />
            </a>
          </div>
        </nav>
      </header>

      <section id="top" className="relative border-b border-white/10">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:py-20">
          <div className="flex flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-md border border-mint/30 bg-mint/10 px-3 py-2 text-sm text-mint">
              <Sparkles className="h-4 w-4" />
              Free desktop app. Bring your own providers.
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl">
              ZecruAI orchestrates AI coding agents on your machine.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              A planner agent runs coder agents on scoped missions, in parallel, using Claude
              Code, Codex CLI, and OpenAI-compatible providers you control.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
              ZecruAI is free. You bring your own subscriptions or API keys. We add zero provider
              markup, so you are not paying a repriced middle layer for model access.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a className="primary-button" href={link.href}>
                <Download className="h-5 w-5" />
                <span>{loading ? 'Checking latest release...' : link.label}</span>
              </a>
              <a className="secondary-button" href={releasesUrl}>
                <CloudDownload className="h-5 w-5" />
                <span>All releases</span>
              </a>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              {link.isDirectAsset
                ? `Direct ${link.platform === 'windows' ? '.exe' : '.dmg'} asset from GitHub Releases.`
                : 'Unsupported platform or offline release lookup; GitHub Releases stays available.'}
              {fromCache ? ' Version loaded from this browser session.' : ''}
            </p>
          </div>

          <div className="relative min-h-[440px] rounded-lg border border-white/10 bg-panel p-4 shadow-glow">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <span className="h-3 w-3 rounded-full bg-coral" />
                <span className="h-3 w-3 rounded-full bg-amber" />
                <span className="h-3 w-3 rounded-full bg-mint" />
              </div>
              <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-400">
                Mission control
              </span>
            </div>
            <div className="mt-5 grid gap-4">
              <div className="rounded-md border border-mint/30 bg-mint/10 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-mint">
                  <CheckCircle2 className="h-4 w-4" />
                  Planner
                </div>
                <p className="text-sm leading-6 text-slate-200">
                  Break the website launch into isolated implementation, gate, deploy, and operator
                  DNS steps.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-white/10 bg-panelSoft p-4">
                  <Code2 className="mb-3 h-5 w-5 text-sky" />
                  <h2 className="text-sm font-semibold text-white">Coder agent</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Implements files and reports audit, fix, verify, and ship status.
                  </p>
                </div>
                <div className="rounded-md border border-white/10 bg-panelSoft p-4">
                  <Database className="mb-3 h-5 w-5 text-amber" />
                  <h2 className="text-sm font-semibold text-white">Memory</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Carries project facts into the next agent so context survives long missions.
                  </p>
                </div>
              </div>
              <div className="rounded-md border border-white/10 bg-[#0b101b] p-4 font-mono text-sm text-slate-300">
                <p className="text-mint">agent bus</p>
                <p className="mt-2">planner -&gt; coder: build smart download website</p>
                <p className="mt-1">coder -&gt; planner: gate passed, branch pushed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-b border-white/10 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="section-kicker">Why it exists</p>
            <h2 className="section-title">Coordinate real coding work without handing control to a cloud IDE.</h2>
            <p className="section-copy">
              ZecruAI keeps agents, project folders, provider credentials, and local config on your
              machine while giving them enough protocol to work as a team.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featureGroups.map((feature) => (
              <article key={feature.title} className="feature-card">
                <feature.icon className="h-6 w-6 text-mint" />
                <h3 className="mt-5 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="section-kicker">How missions flow</p>
            <h2 className="section-title">Planner first, coders scoped, progress visible.</h2>
          </div>
          <div className="grid gap-4">
            {steps.map((step, index) => (
              <div key={step} className="flex gap-4 rounded-md border border-white/10 bg-panel p-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-mint text-sm font-bold text-ink">
                  {index + 1}
                </span>
                <p className="pt-1 text-base leading-7 text-slate-300">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="screens" className="border-b border-white/10 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <p className="section-kicker">Screenshots</p>
              <h2 className="section-title">Real product shots belong here.</h2>
              <p className="section-copy">
                These slots intentionally show exact file paths. Replace them with real captures
                from the desktop app before launch.
              </p>
            </div>
            <a className="text-link" href="./screens/README.md">
              Screenshot checklist <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {screenshotSlots.map((slot) => (
              <article key={slot.path} className="screenshot-slot">
                <div className="flex h-44 items-center justify-center rounded-md border border-dashed border-white/20 bg-[#0b101b] p-5 text-center">
                  <div>
                    <CircleHelp className="mx-auto mb-3 h-8 w-8 text-slate-500" />
                    <p className="text-sm font-semibold text-slate-200">{slot.title}</p>
                    <code className="mt-3 block break-all text-xs text-mint">{slot.path}</code>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-400">{slot.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl rounded-lg border border-white/10 bg-panel p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-amber">
                <LockKeyhole className="h-4 w-4" />
                Local-first and provider-owned
              </div>
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                Start with the free desktop app. Keep your model spend where it already is.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                ZecruAI coordinates agents. It does not resell model access, add analytics, or set
                cookies in this static site.
              </p>
            </div>
            <a className="primary-button" href={link.href}>
              <Download className="h-5 w-5" />
              <span>{loading ? 'Checking latest release...' : link.label}</span>
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>ZecruAI</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <a className="footer-link" href={githubRepoUrl}>
              GitHub
            </a>
            <a className="footer-link" href={releasesUrl}>
              Releases
            </a>
            <a className="footer-link" href={licenseUrl}>
              License
            </a>
            <a className="footer-link" href={`mailto:${contactEmail}`}>
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default App;
