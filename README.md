# ZecruAI Website

Static marketing site for `zecruai.com`, built with Vite, React, TypeScript, and Tailwind.

## Commands

```bash
npm ci
npm run test
npm run build
```

## Screenshot Slots

Place real desktop screenshots in `apps/website/public/screens/`:

- `canvas.png` - mission canvas or multi-agent workspace.
- `agent-chat.png` - active planner/coder chat.
- `project-memory.png` - project memory or mission distillation UI.

The website intentionally renders placeholder slots until those files are provided. Do not replace them with mock screenshots.

## Deployment

The GitHub Pages workflow builds the site from `apps/website` and uploads the static `dist` output.

Custom domain file: `apps/website/public/CNAME` contains `zecruai.com`.
