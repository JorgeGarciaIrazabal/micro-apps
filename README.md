# Micro Apps

A collection of small web apps hosted on GitHub Pages.

**Live site:** https://jorgegarcairazabal.github.io/micro-apps/

## Apps

| App | Link |
|-----|------|
| Clara's Easter Egg Hunt | [Play](https://jorgegarcairazabal.github.io/micro-apps/clara-egg-hunt/) |

## Adding a new app

1. Create a new folder under `apps/<app-name>/`
2. Set `base: '/micro-apps/<app-name>/'` in its vite config
3. Add build + copy steps to `.github/workflows/deploy.yml`
4. Add a card to the root `index.html`
