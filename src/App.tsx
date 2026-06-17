import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  CircleHelp,
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
  ShieldCheck,
  TerminalSquare,
  Workflow,
} from 'lucide-react';
import {
  fetchLatestRelease,
  makeDownloadLink,
  readCachedRelease,
  writeCachedRelease,
  type GitHubRelease,
} from './download';

export type RouteName = 'home' | 'getting-started' | 'faq' | 'not-found';

const githubRepoUrl = 'https://github.com/Zecruu/ZecruAI-Releases';
const releasesUrl = 'https://github.com/Zecruu/ZecruAI-Releases/releases/latest';
const contactEmail = 'mikedemchak135@gmail.com';

const featureGroups = [
  {
    icon: Workflow,
    title: 'Planner and coder missions',
    body: 'A planner can break a project goal into scoped missions while coder agents implement, test, and report progress.',
  },
  {
    icon: GitBranch,
    title: 'Parallel local agents',
    body: 'Run multiple agents against local project folders while keeping their work visible and reviewable.',
  },
  {
    icon: BookOpenCheck,
    title: 'First-run wizard',
    body: 'Guided setup gets you from download to first agent in minutes: CLI checks, auth, project folder, and first prompt.',
  },
  {
    icon: BrainCircuit,
    title: 'Project memory',
    body: 'Durable notes and mission summaries help later work remember constraints, decisions, and product context.',
  },
  {
    icon: TerminalSquare,
    title: 'Use the CLIs you already trust',
    body: 'Works with Claude Code, Codex CLI, and OpenAI-compatible bring-your-own providers.',
  },
  {
    icon: HardDrive,
    title: 'Cloud command center',
    body: 'Use the web and mobile surfaces for relay, restart, activity, and needs-review decisions when you are away from the desktop.',
  },
];

const gettingStartedSteps = [
  {
    icon: Download,
    title: 'Download and install',
    body: 'Use the Windows or macOS button for the latest public release from GitHub.',
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
    body: 'Use Claude Code, Codex-style workflows, or OpenAI-compatible API providers you connect.',
  },
];

const faqs = [
  {
    question: 'What is ZecruAI?',
    answer:
      'ZecruAI is a desktop AI agent workspace for coding and building software. It helps you coordinate planner and coder agents across real project work.',
  },
  {
    question: 'How do downloads work?',
    answer:
      'The Windows and macOS buttons resolve the latest public release automatically. If the lookup fails, they fall back to the GitHub latest-release page.',
  },
  {
    question: 'What model access do I need?',
    answer:
      'Use the coding CLI, subscription, or API provider you choose. ZecruAI coordinates the workspace; model and provider usage is billed by your provider unless a plan explicitly says otherwise.',
  },
  {
    question: 'Which platforms are supported?',
    answer: 'Windows and macOS downloads are available today. Linux is not supported yet.',
  },
  {
    question: 'What does the Cloud plan cover?',
    answer:
      'Cloud features cover coordination, relay, history, mobile command center, activity, restart, and needs-review or plan-approval flows. They do not automatically include hosted model usage.',
  },
  {
    question: 'What project context can providers see?',
    answer:
      'The product is designed around local project work and explicit provider connections. Your selected provider can receive the prompts and code context an agent sends for a task.',
  },
  {
    question: 'Can I coordinate multiple agents?',
    answer:
      'Yes. ZecruAI supports planner/coder coordination, progress reports, plan approvals, and multi-agent workflows for larger software tasks.',
  },
];

export function currentRouteFromPath(pathname: string): RouteName {
  const path = pathname.toLowerCase();
  if (path.endsWith('/404.html')) return 'not-found';
  if (path.includes('/getting-started')) return 'getting-started';
  if (path.includes('/faq')) return 'faq';
  return 'home';
}

function currentRoute(): RouteName {
  if (typeof window === 'undefined') return 'home';
  return currentRouteFromPath(window.location.pathname);
}

function routeHref(current: RouteName, target: RouteName): string {
  if (target === current) return '#top';
  const prefix = current === 'home' || current === 'not-found' ? './' : '../';
  if (target === 'home') return prefix;
  return `${prefix}${target}/`;
}

function useLatestRelease(): {
  release: GitHubRelease | null;
  loading: boolean;
  fromCache: boolean;
} {
  const [release, setRelease] = useState<GitHubRelease | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const cached = readCachedRelease(window.sessionStorage);
    if (cached) {
      setRelease(cached);
      setFromCache(true);
    }
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
    release,
    loading,
    fromCache,
  };
}

function DownloadButtons({
  release,
  loading,
}: {
  release: GitHubRelease | null;
  loading: boolean;
}) {
  const windows = makeDownloadLink(release, 'windows');
  const macos = makeDownloadLink(release, 'macos');
  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
      <a className="primary-button w-full sm:w-auto" href={windows.href}>
        <Download className="h-5 w-5" />
        <span>{loading ? 'Checking Windows...' : windows.label}</span>
      </a>
      <a className="secondary-button w-full sm:w-auto" href={macos.href}>
        <Download className="h-5 w-5" />
        <span>{loading ? 'Checking macOS...' : macos.label}</span>
      </a>
    </div>
  );
}

function Header({ route }: { route: RouteName }) {
  return (
    <header className="border-b border-line bg-cream/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <a href={routeHref(route, 'home')} className="flex items-center gap-3" aria-label="ZecruAI home">
          <img src={route === 'home' ? './icons/zecruai-icon-64.png' : '../icons/zecruai-icon-64.png'} alt="" className="h-9 w-9 rounded-md" />
          <span className="text-lg font-semibold">ZecruAI</span>
        </a>
        <div className="flex items-center gap-2 text-sm text-stone-800">
          <a className="nav-link hidden sm:inline-flex" href={routeHref(route, 'getting-started')}>
            Getting started
          </a>
          <a className="nav-link hidden sm:inline-flex" href={routeHref(route, 'faq')}>
            FAQ
          </a>
          <a className="icon-link" href={githubRepoUrl} aria-label="GitHub releases repository">
            <Github className="h-5 w-5" />
          </a>
        </div>
      </nav>
    </header>
  );
}

function HomePage({
  route,
  release,
  loading,
  fromCache,
}: {
  route: RouteName;
  release: GitHubRelease | null;
  loading: boolean;
  fromCache: boolean;
}) {
  const releaseVersion = release ? release.tag_name.replace(/^v/i, '') : null;
  return (
    <>
      <section id="top" className="relative border-b border-line">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:py-20">
          <div className="flex flex-col justify-center">
            <h1 className="max-w-4xl text-5xl font-semibold leading-tight text-charcoal sm:text-6xl lg:text-7xl">
              ZecruAI is the command center for AI coding agents.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-800">
              Coordinate planner and coder agents from a desktop workspace, route work across local
              projects, and keep review decisions visible across desktop, web, and mobile.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700">
              Use Claude Code, Codex-style workflows, or your own OpenAI-compatible providers.
              ZecruAI Cloud covers coordination, relay, history, and mobile command-center
              features; model usage stays with the provider you choose.
            </p>
            <div className="mt-8">
              <DownloadButtons release={release} loading={loading} />
            </div>
            <p className="mt-3 text-sm text-stone-600">
              {releaseVersion
                ? `Latest public release: ${releaseVersion}.`
                : 'If live lookup is unavailable, both buttons open the latest-release page.'}
              {fromCache ? ' Version loaded from this browser session.' : ''}
            </p>
          </div>

          <div className="relative min-h-[440px] rounded-lg border border-line bg-panel p-4 shadow-glow">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2 text-sm text-stone-800">
                <span className="h-3 w-3 rounded-full bg-coral" />
                <span className="h-3 w-3 rounded-full bg-amber" />
                <span className="h-3 w-3 rounded-full bg-clay" />
              </div>
              <span className="rounded-md bg-paper px-2 py-1 text-xs text-stone-700">
                Mission control
              </span>
            </div>
            <div className="mt-5 grid gap-4">
              <div className="rounded-md border border-clay/30 bg-clay/10 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-clay">
                  <CheckCircle2 className="h-4 w-4" />
                  Planner
                </div>
                <p className="text-sm leading-6 text-stone-800">
                  Split the work into parallel missions, put each agent on a branch, then review
                  and merge changes from the app.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-line bg-panelSoft p-4">
                  <GitBranch className="mb-3 h-5 w-5 text-sky" />
                  <h2 className="text-sm font-semibold text-charcoal">Isolated branches</h2>
                  <p className="mt-2 text-sm leading-6 text-stone-700">
                    Agents do their work in separate worktrees so parallel edits stay reviewable.
                  </p>
                </div>
                <div className="rounded-md border border-line bg-panelSoft p-4">
                  <Database className="mb-3 h-5 w-5 text-amber" />
                  <h2 className="text-sm font-semibold text-charcoal">Memory</h2>
                  <p className="mt-2 text-sm leading-6 text-stone-700">
                    Durable project facts and mission summaries keep later turns grounded.
                  </p>
                </div>
              </div>
              <div className="rounded-md border border-line bg-[#2f2924] p-4 font-mono text-sm text-[#fff7ed]">
                <p className="text-amber">agent bus</p>
                <p className="mt-2">planner -&gt; coder: build the getting-started page</p>
                <p className="mt-1">coder -&gt; planner: tests green, branch pushed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProductShowcaseSection />
      <FeatureSection />
      <PricingSection />
      <MissionFlowSection route={route} />
      <FinalCta release={release} loading={loading} />
    </>
  );
}

function ProductShowcaseSection() {
  return (
    <section className="border-b border-line px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
            <p className="section-kicker">Product tour</p>
            <h2 className="section-title">Real setup, real mission control.</h2>
            <p className="section-copy">
              ZecruAI brings local agents, CLI setup, planner review, and cloud command-center
              access into one workspace built for software teams that want visibility.
            </p>
          </div>
          <p className="text-sm leading-6 text-stone-700 lg:max-w-xl lg:justify-self-end">
            These are live product surfaces from the desktop app. The dashboard image is cropped
            below the account bar so private account identifiers are not published.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <figure className="showcase-card">
            <div className="showcase-image-shell aspect-[4/3] sm:aspect-[16/9] lg:aspect-[16/10]">
              <img
                src="./screens/zecruai-dashboard-showcase.jpg"
                alt="ZecruAI desktop dashboard showing the planner mission-control surface and local project workspace."
                className="h-full w-full object-cover object-left-top"
                loading="lazy"
              />
            </div>
            <figcaption className="showcase-caption">
              <span className="showcase-label">Mission control</span>
              Coordinate planner and coder agents from a desktop workspace, with project status,
              local tools, and review actions close at hand.
            </figcaption>
          </figure>

          <figure className="showcase-card">
            <div className="showcase-image-shell max-h-[760px] overflow-hidden">
              <img
                src="./screens/zecruai-setup-showcase.jpg"
                alt="ZecruAI setup wizard showing environment checks for Git, Node, npm, Claude, Codex, and deployment CLIs."
                className="h-auto w-full"
                loading="lazy"
              />
            </div>
            <figcaption className="showcase-caption">
              <span className="showcase-label">Guided setup</span>
              The first-run wizard checks real CLIs and gives clear install or login guidance
              before you launch an agent.
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

function FeatureSection() {
  return (
    <section id="features" className="border-b border-line px-5 py-16 sm:px-8">
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
              <feature.icon className="h-6 w-6 text-clay" />
              <h3 className="mt-5 text-lg font-semibold text-charcoal">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-stone-700">{feature.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section className="border-b border-line px-5 py-16 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="section-kicker">Plans and providers</p>
          <h2 className="section-title">Coordination from ZecruAI. Models from the providers you choose.</h2>
          <p className="section-copy">
            ZecruAI Cloud is for coordination, relay, history, mobile command-center access, and
            review workflows. Model usage remains tied to your Claude, Codex, or API provider
            account unless a plan explicitly says otherwise.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <article className="pricing-card">
            <ShieldCheck className="h-6 w-6 text-clay" />
            <h3>Desktop workspace</h3>
            <p>Launch local agents, inspect progress, and review software changes from one place.</p>
          </article>
          <article className="pricing-card">
            <KeyRound className="h-6 w-6 text-sky" />
            <h3>Your provider</h3>
            <p>Connect the model subscription, coding CLI, or compatible API account you prefer.</p>
          </article>
          <article className="pricing-card">
            <Workflow className="h-6 w-6 text-amber" />
            <h3>Cloud command center</h3>
            <p>Use relay, restart, activity, history, and plan approvals when you are away.</p>
          </article>
        </div>
      </div>
    </section>
  );
}

function MissionFlowSection({ route }: { route: RouteName }) {
  const steps = [
    'Describe the software outcome you want and let a planner shape the work.',
    'Send scoped missions to coder agents that can inspect, edit, test, and report.',
    'Approve plans, restart stuck agents, and review activity from desktop, web, or mobile.',
  ];

  return (
    <section className="border-b border-line px-5 py-16 sm:px-8">
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
            <div key={step} className="flex gap-4 rounded-md border border-line bg-panel p-5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-clay text-sm font-bold text-paper">
                {index + 1}
              </span>
              <p className="pt-1 text-base leading-7 text-stone-800">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GettingStartedPage({
  route,
  release,
  loading,
}: {
  route: RouteName;
  release: GitHubRelease | null;
  loading: boolean;
}) {
  return (
    <>
      <section id="top" className="border-b border-line px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="section-kicker">Getting started</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-5xl font-semibold leading-tight text-charcoal sm:text-6xl">
                From download to your first agent.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-800">
                ZecruAI's first-run wizard mirrors the real path: install the app, connect Claude
                Code or Codex CLI, pick a project folder, then launch your first coding agent.
              </p>
            </div>
            <div className="rounded-lg border border-line bg-panel p-5">
              <DownloadButtons release={release} loading={loading} />
              <p className="mt-4 text-sm leading-6 text-stone-700">
                The buttons use the public GitHub Releases channel and fall back to the
                latest-release page if live lookup fails.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="section-kicker">Requirements</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {requirements.map((item) => (
              <article key={item.title} className="feature-card">
                <item.icon className="h-6 w-6 text-clay" />
                <h2 className="mt-5 text-lg font-semibold text-charcoal">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-stone-700">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="section-kicker">Wizard path</p>
            <h2 className="section-title">The setup flow is built into the app.</h2>
            <p className="section-copy">
              The wizard helps you connect a provider, choose a project folder, and launch a
              useful first coding agent without exposing private infrastructure details.
            </p>
          </div>
          <div className="grid gap-4">
            {gettingStartedSteps.map((step, index) => (
              <article key={step.title} className="step-card">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-clay text-paper">
                  <step.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-600">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-charcoal">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-700">{step.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-lg border border-line bg-panel p-6">
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
          <div className="rounded-lg border border-line bg-panel p-6">
            <h2 className="text-2xl font-semibold text-charcoal">Need the short answers?</h2>
            <p className="mt-3 text-sm leading-6 text-stone-700">
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
  release,
  loading,
}: {
  route: RouteName;
  release: GitHubRelease | null;
  loading: boolean;
}) {
  return (
    <>
      <section id="top" className="border-b border-line px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="section-kicker">FAQ</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-5xl font-semibold leading-tight text-charcoal sm:text-6xl">
                Short answers before you install.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-800">
                ZecruAI is a local-first desktop app for coordinating coding agents with the model
                access you already pay for.
              </p>
            </div>
            <div className="rounded-lg border border-line bg-panel p-5">
              <DownloadButtons release={release} loading={loading} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line px-5 py-16 sm:px-8">
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
        <div className="mx-auto max-w-7xl rounded-lg border border-line bg-panel p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-clay">
                <BookOpenCheck className="h-4 w-4" />
                First run support
              </div>
              <h2 className="text-2xl font-semibold text-charcoal sm:text-3xl">
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

function NotFoundPage({
  route,
  release,
  loading,
}: {
  route: RouteName;
  release: GitHubRelease | null;
  loading: boolean;
}) {
  return (
    <section id="top" className="px-5 py-20 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
        <div>
          <p className="section-kicker">404</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-tight text-charcoal sm:text-6xl">
            This page is not in the mission plan.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-800">
            The ZecruAI site is still small: home, getting started, FAQ, releases, and GitHub.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a className="primary-button" href={routeHref(route, 'home')}>
              <ArrowUpRight className="h-5 w-5" />
              <span>Go home</span>
            </a>
            <a className="secondary-button" href={routeHref(route, 'getting-started')}>
              <BookOpenCheck className="h-5 w-5" />
              <span>Getting started</span>
            </a>
          </div>
        </div>
        <div className="rounded-lg border border-line bg-panel p-6">
          <h2 className="text-2xl font-semibold text-charcoal">Looking for the app?</h2>
          <p className="mt-3 text-sm leading-6 text-stone-700">
            The latest desktop installer is still available from GitHub Releases.
          </p>
          <div className="mt-6">
            <DownloadButtons release={release} loading={loading} />
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta({
  release,
  loading,
}: {
  release: GitHubRelease | null;
  loading: boolean;
}) {
  return (
    <section className="px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-7xl rounded-lg border border-line bg-panel p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-amber">
              <LockKeyhole className="h-4 w-4" />
              Local-first and provider-owned
            </div>
            <h2 className="text-2xl font-semibold text-charcoal sm:text-3xl">
              Download ZecruAI for Windows or macOS.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-700">
              Start from the latest public release. Questions before launch or setup? Email
              {' '}
              <a className="text-link" href={`mailto:${contactEmail}`}>{contactEmail}</a>.
            </p>
          </div>
          <DownloadButtons release={release} loading={loading} />
        </div>
      </div>
    </section>
  );
}

function Footer({ route }: { route: RouteName }) {
  return (
    <footer className="border-t border-line px-5 py-8 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-stone-700 md:flex-row md:items-center md:justify-between">
        <p>ZecruAI</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <a className="footer-link" href={routeHref(route, 'getting-started')}>
            Getting started
          </a>
          <a className="footer-link" href={routeHref(route, 'faq')}>
            FAQ
          </a>
          <a className="footer-link" href={releasesUrl}>
            Releases
          </a>
          <a className="footer-link" href={githubRepoUrl}>
            Release repo
          </a>
          <a className="footer-link" href={`mailto:${contactEmail}`}>
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

function App({ initialRoute }: { initialRoute?: RouteName }) {
  const route = useMemo(() => initialRoute ?? currentRoute(), [initialRoute]);
  const { release, loading, fromCache } = useLatestRelease();

  return (
    <main className="min-h-screen overflow-hidden bg-cream text-charcoal">
      <Header route={route} />
      {route === 'home' ? (
        <HomePage route={route} release={release} loading={loading} fromCache={fromCache} />
      ) : route === 'getting-started' ? (
        <GettingStartedPage route={route} release={release} loading={loading} />
      ) : route === 'faq' ? (
        <FAQPage route={route} release={release} loading={loading} />
      ) : (
        <NotFoundPage route={route} release={release} loading={loading} />
      )}
      <Footer route={route} />
    </main>
  );
}

export default App;

