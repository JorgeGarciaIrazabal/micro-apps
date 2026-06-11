# Micro Apps

A collection of small web apps hosted on GitHub Pages.

**Live site:** https://jorgegarciairazabal.github.io/micro-apps/

---

## 🛠️ Developer Guide

This repository is set up as a monorepo under `apps/` with a root `Makefile` to simplify local development, building, and serving.

### 1. Build the Apps
To install dependencies and build production bundles for all micro-apps, run the following command in the root folder:
```bash
make build
```
This script will:
* Loop through all subdirectories in `apps/`.
* Run `npm install` and `npm run build` inside each app.
* Copy the resulting production build files (from their `dist/` directory) to the root directory under their respective folder name (e.g. `/andalucia-scouting-2026/`) to match the base paths for deployment.

### 2. Serve Locally
To serve all build applications locally at `http://localhost:8000/micro-apps/` (matching the subfolder base paths):
```bash
make serve
```
This will:
1. Re-run `make build` to ensure all files are up-to-date.
2. Clear port `8000` if it is currently in use.
3. Create a self-referential symlink `micro-apps -> .` to allow Vite's absolute base path (`/micro-apps/<app-name>/`) to resolve correctly on a local python server.
4. Launch a Python HTTP server on port `8000`.

Open [http://localhost:8000/micro-apps/](http://localhost:8000/micro-apps/) or [http://localhost:8000/micro-apps/andalucia-scouting-2026/](http://localhost:8000/micro-apps/andalucia-scouting-2026/) to preview.

### 3. Publish to GitHub Pages
Deployment is fully automated via GitHub Actions:
1. Verify that your app is listed in `.github/workflows/deploy.yml` under both the build steps and assembly steps.
2. Commit your changes and push to the `main` branch:
   ```bash
   git add -A
   git commit -m "Your commit message"
   git push origin main
   ```
3. The **Deploy to GitHub Pages** GitHub Action will automatically compile, package, and publish the applications.

---

## 🚀 Adding a New App

1. Create a new Vite/React folder under `apps/<app-name>/`.
2. Ensure you set `base: '/micro-apps/<app-name>/'` in its `vite.config.js`.
3. Add build + copy assembly steps to `.github/workflows/deploy.yml`.
4. Add a card to the root `index.html` referencing the new sub-url.
