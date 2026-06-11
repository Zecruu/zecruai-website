import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  CircleHelp,
  CloudDownload,
  Code2,
  Database,
  Download,
  FolderOpen,
  GitBranch,
  Github,
  HardDrive,
  KeyRound,
  Laptop,
  ListChecks,
  LockKeyhole,
  RefreshCcw,
  ShieldCheck,
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

type RouteName = 'home' | 'getting-started' | 'faq';

const githubRepoUrl = 'https://github.com/Zecruu/ZecruAgentsHive';
const releasesUrl = 'https://github.com/Zecruu/ZecruAgentsHive/releases/latest';
const licenseUrl = 'https://github.com/Zecruu/ZecruAgentsHive/blob/main/LICENSE';
const contactEmail = 'hello@zecruai.com';

const featureGroups = [
  {
    icon: Workflow,
    title: 'Planner and coder missions',
    body: 'A planner turns a goal into scoped work, then coder agents implement and report back through the agent bus.',
  },
  {
    icon: GitBranch,
    title: 'Worktree isolation',
    body: 'Every agent works on its own branch. Review changes and merge from the app without mixing parallel work in one folder.',
  },
  {
    icon: BookOpenCheck,
    title: 'First-run wizard',
    body: 'Guided setup gets you from download to first agent in minutes: CLI checks, auth, project folder, and first prompt.',
  },
  {
    icon: BrainCircuit,
    title: 'Project memory and distillation',
    body: 'Durable project memory and mission distillation carry decisions, constraints, and learned context across long sessions.',
  },
  {
    icon: TerminalSquare,
    title: 'Use the CLIs you already trust',
    body: 'Works with Claude Code, Codex CLI, and OpenAI-compatible bring-your-own providers.',
  },
  {
    icon: HardDrive,
    title: 'Durable local config',
    body: 'Project mappings and settings are stored locally with atomic writes and backup recovery for daily use.',
  },
];

const gettingStartedSteps = [
  {
    icon: Download,
    title: 'Download and install',
    body: 'Use the smart download button for the latest Windows installer or macOS DMG from GitHub Releases.',
  },
  {
    icon: TerminalSquare,
    title: 'Connect a coding CLI',
    body: 'The first-run wizard checks for Claude Code or Codex CLI and walks you through install or auth if needed.',
  },
  {
    icon: FolderOpen,
    title: 'Pick a project folder',
    body: 'Choose the repo you want agents to work in. ZecruAI builds context from that folder, project memory, and mission briefs.',
  },
  {
    icon: Workflow,
    title: 'Spawn your first agent',
    body: 'Launch an agent, give it a focused mission, and watch reports flow back in the workspace.',
  },
];

const requirements = [
  {
    icon: Laptop,
    title: 'Desktop platform',
    body: 'Windows 10+ or macOS. Linux is not supported yet.',
  },
  {
    icon: Code2,
    title: 'CLI install path',
    body: 'Node.js and npm are needed when the wizard installs Claude Code or Codex CLI for you.',
  },
  {
    icon: KeyRound,
    title: 'Provider access',
    body: 'Use a Claude Code or Codex subscription, or any OpenAI-compatible API key you bring yourself.',
  },
];

const faqs = [
  {
    question: 'Is ZecruAI free?',
    answer: 'Yes. The desktop app is free today.',
  },
  {
    question: 'Do you mark up tokens?',
    answer:
      'No. Your provider bill is your only bill. BYOK API keys stay local, and subscription auth stays in the CLI you use.',
  },
  {
    question: 'What do I need?',
    answer:
      'A Windows or macOS machine, a project folder, and either Claude Code, Codex CLI, or an OpenAI-compatible API key.',
  },
  {
    question: 'Which platforms are supported?',
    answer: 'Windows and macOS today. Linux is not supported yet.',
  },
  {
    question: 'Is my code sent anywhere?',
    answer:
      'Agents run locally. Only your chosen provider sees the prompts and code context that the agent sends to that provider.',
  },
  {
    question: "What's the catch?",
    answer:
      'None today. Optional paid cloud conveniences may come later, but the local desktop app is free and provider access stays yours.',
  },
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

function currentRoute(): RouteName {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('/getting-started')) return 'getting-started';
  if (path.includes('/faq')) return 'faq';
  return 'home';
}

function routeHref(current: RouteName, target: RouteName): string {
  if (target === current) return '#top';
  const prefix = current === 'home' ? './' : '../';
  if (target === 'home') return prefix;
  return `${prefix}${target}/`;
}

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

function DownloadButtons({
  link,
  loading,
}: {
  link: DownloadLink;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <a className="primary-button" href={link.href}>
        <Download className="h-5 w-5" />
        <span>{loading ? 'Checking latest release...' : link.label}</span>
      </a>
      <a className="secondary-button" href={releasesUrl}>
        <CloudDownload className="h-5 w-5" />
        <span>All releases</span>
      </a>
    </div>
  );
}

function Header({ route }: { route: RouteName }) {
  return (
    <header className="border-b border-white/10 bg-ink/92 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <a href={routeHref(route, 'home')} className="flex items-center gap-3" aria-label="ZecruAI home">
          <img src={route === 'home' ? './icons/zecruai-icon-64.png' : '../icons/zecruai-icon-64.png'} alt="" className="h-9 w-9 rounded-md" />
          <span className="text-lg font-semibold">ZecruAI</span>
        </a>
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <a className="nav-link hidden sm:inline-flex" href={routeHref(route, 'getting-started')}>
            Getting started
          </a>
          <a className="nav-link hidden sm:inline-flex" href={routeHref(route, 'faq')}>
            FAQ
          </a>
          <a className="icon-link" href={githubRepoUrl} aria-label="GitHub repository">
            <Github className="h-5 w-5" />
          </a>
        </div>
      </nav>
    </header>
  );
}

function HomePage({
  route,
  link,
  loading,
  fromCache,
}: {
  route: RouteName;
  link: DownloadLink;
  loading: boolean;
  fromCache: boolean;
}) {
  return (
    <>
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
              A planner agent runs coder agents on scoped missions, in parallel, using Claude Code,
              Codex CLI, and OpenAI-compatible providers you control.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
              ZecruAI is free. You bring your own subscriptions or API keys. We add zero provider
              markup, so you are not paying a repriced middle layer for model access.
            </p>
            <div className="mt-8">
              <DownloadButtons link={link} loading={loading} />
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
                  Split the work into parallel missions, put each agent on a branch, then review
                  and merge changes from the app.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-white/10 bg-panelSoft p-4">
                  <GitBranch className="mb-3 h-5 w-5 text-sky" />
                  <h2 className="text-sm font-semibold text-white">Isolated branches</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Agents do their work in separate worktrees so parallel edits stay reviewable.
                  </p>
                </div>
                <div className="rounded-md border border-white/10 bg-panelSoft p-4">
                  <Database className="mb-3 h-5 w-5 text-amber" />
                  <h2 className="text-sm font-semibold text-white">Memory</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Durable project facts and mission summaries keep later turns grounded.
                  </p>
                </div>
              </div>
              <div className="rounded-md border border-white/10 bg-[#0b101b] p-4 font-mono text-sm text-slate-300">
                <p className="text-mint">agent bus</p>
                <p className="mt-2">planner -&gt; coder: build the getting-started page</p>
                <p className="mt-1">coder -&gt; planner: tests green, branch pushed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeatureSection />
      <PricingSection />
      <MissionFlowSection route={route} />
      <ScreenshotSection route={route} />
      <FinalCta link={link} loading={loading} />
    </>
  );
}

function FeatureSection() {
  return (
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
  );
}

function PricingSection() {
  return (
    <section className="border-b border-white/10 px-5 py-16 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="section-kicker">Pricing advantage</p>
          <h2 className="section-title">Free orchestration. Direct provider pricing.</h2>
          <p className="section-copy">
            Editor-subscription tools often resell model access through per-seat or per-token
            pricing. ZecruAI is the coordination layer for the subscriptions and keys you already
            have.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <article className="pricing-card">
            <ShieldCheck className="h-6 w-6 text-mint" />
            <h3>Free app</h3>
            <p>The desktop orchestrator is free today.</p>
          </article>
          <article className="pricing-card">
            <KeyRound className="h-6 w-6 text-sky" />
            <h3>Your provider</h3>
            <p>Claude Code, Codex CLI, or BYO OpenAI-compatible API keys.</p>
          </article>
          <article className="pricing-card">
            <Workflow className="h-6 w-6 text-amber" />
            <h3>Parallel agents</h3>
            <p>Run multiple agents without paying ZecruAI a model-access markup.</p>
          </article>
        </div>
      </div>
    </section>
  );
}

function MissionFlowSection({ route }: { route: RouteName }) {
  const steps = [
    'A planner turns a goal into an executable mission.',
    'Coder agents receive scoped work on isolated branches and report progress back through the bus.',
    'Memory, repo maps, and mission summaries keep the next turn grounded.',
  ];

  return (
    <section className="border-b border-white/10 px-5 py-16 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="section-kicker">How missions flow</p>
          <h2 className="section-title">Planner first, coders scoped, progress visible.</h2>
          <a className="text-link mt-5" href={routeHref(route, 'getting-started')}>
            Start your first mission <ArrowUpRight className="h-4 w-4" />
          </a>
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
  );
}

function ScreenshotSection({ route }: { route: RouteName }) {
  return (
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
          <a className="text-link" href={route === 'home' ? './screens/README.md' : '../screens/README.md'}>
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
  );
}

function GettingStartedPage({
  route,
  link,
  loading,
}: {
  route: RouteName;
  link: DownloadLink;
  loading: boolean;
}) {
  return (
    <>
      <section id="top" className="border-b border-white/10 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="section-kicker">Getting started</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-5xl font-semibold leading-tight text-white sm:text-6xl">
                From download to your first agent.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
                ZecruAI's first-run wizard mirrors the real path: install the app, connect Claude
                Code or Codex CLI, pick a project folder, then launch your first coding agent.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-panel p-5">
              <DownloadButtons link={link} loading={loading} />
              <p className="mt-4 text-sm leading-6 text-slate-400">
                The button uses GitHub Releases and falls back to the releases page if the live
                lookup fails.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="section-kicker">Requirements</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {requirements.map((item) => (
              <article key={item.title} className="feature-card">
                <item.icon className="h-6 w-6 text-mint" />
                <h2 className="mt-5 text-lg font-semibold text-white">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="section-kicker">Wizard path</p>
            <h2 className="section-title">The setup flow is built into the app.</h2>
            <p className="section-copy">
              The wizard is meant to get a new free-tier user to a useful first agent without
              making Supabase sign-in or cloud features mandatory.
            </p>
          </div>
          <div className="grid gap-4">
            {gettingStartedSteps.map((step, index) => (
              <article key={step.title} className="step-card">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-mint text-ink">
                  <step.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{step.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-lg border border-white/10 bg-panel p-6">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-amber">
              <ListChecks className="h-4 w-4" />
              Suggested first prompt
            </div>
            <pre className="code-panel whitespace-pre-wrap">
{`You are a coder for this project.
Read the repo map, identify the smallest useful improvement,
make the change on your branch, run the relevant tests,
and report what changed plus verification evidence.`}
            </pre>
          </div>
          <div className="rounded-lg border border-white/10 bg-panel p-6">
            <h2 className="text-2xl font-semibold text-white">Need the short answers?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              The FAQ covers pricing, keys, platforms, local execution, and what your chosen
              provider can see.
            </p>
            <a className="secondary-button mt-6" href={routeHref(route, 'faq')}>
              <CircleHelp className="h-5 w-5" />
              <span>Read the FAQ</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function FAQPage({
  route,
  link,
  loading,
}: {
  route: RouteName;
  link: DownloadLink;
  loading: boolean;
}) {
  return (
    <>
      <section id="top" className="border-b border-white/10 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="section-kicker">FAQ</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-5xl font-semibold leading-tight text-white sm:text-6xl">
                Short answers before you install.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
                ZecruAI is a local-first desktop app for coordinating coding agents with the model
                access you already pay for.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-panel p-5">
              <DownloadButtons link={link} loading={loading} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-4">
          {faqs.map((faq) => (
            <article key={faq.question} className="faq-item">
              <h2>{faq.question}</h2>
              <p>{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <PricingSection />

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl rounded-lg border border-white/10 bg-panel p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-mint">
                <BookOpenCheck className="h-4 w-4" />
                First run support
              </div>
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                The getting-started guide follows the app's real wizard.
              </h2>
            </div>
            <a className="secondary-button" href={routeHref(route, 'getting-started')}>
              <ArrowUpRight className="h-5 w-5" />
              <span>Open guide</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function FinalCta({
  link,
  loading,
}: {
  link: DownloadLink;
  loading: boolean;
}) {
  return (
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
          <DownloadButtons link={link} loading={loading} />
        </div>
      </div>
    </section>
  );
}

function Footer({ route }: { route: RouteName }) {
  return (
    <footer className="border-t border-white/10 px-5 py-8 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <p>ZecruAI</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <a className="footer-link" href={routeHref(route, 'getting-started')}>
            Getting started
          </a>
          <a className="footer-link" href={routeHref(route, 'faq')}>
            FAQ
          </a>
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
  );
}

function App() {
  const route = currentRoute();
  const { link, loading, fromCache } = useDownloadLink();

  return (
    <main className="min-h-screen overflow-hidden bg-ink text-slate-100">
      <Header route={route} />
      {route === 'home' ? (
        <HomePage route={route} link={link} loading={loading} fromCache={fromCache} />
      ) : route === 'getting-started' ? (
        <GettingStartedPage route={route} link={link} loading={loading} />
      ) : (
        <FAQPage route={route} link={link} loading={loading} />
      )}
      <Footer route={route} />
    </main>
  );
}

export default App;
