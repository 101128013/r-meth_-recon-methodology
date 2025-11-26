<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1O7kyVs1i6td5mMG2ra_TTqONQj5HwfNX

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Tests & Validation

- Validate content structure (unique `id`s and valid `ContentType`) with:
  - `npm run validate`
- Run unit tests:
  - `npm test`

Husky is configured to run the validate script on commit — run `npm install` to set up the hooks.

## Deploy to GitHub Pages

This project includes a GitHub Actions workflow that builds the Vite site and deploys it to the `gh-pages` branch anytime you push to `main`.

Steps:

1. Ensure the repository is published on GitHub (public or private), and that the `gh-pages` branch may be used for GitHub Pages.
2. The workflow automatically runs on `push` to `main` and will produce the built site in the `gh-pages` branch.
3. Optionally, configure a custom domain or repository homepage in the GitHub Pages settings.

If you prefer to deploy from the command line, you can locally build (`npm run build`) and then publish the `dist` directory to the `gh-pages` branch using your own script or tooling (for example, `gh-pages` package or use GitHub CLI to create a deploy commit).

## Deploy to GitHub Pages (automatic)

This repo includes a GitHub Actions workflow (`.github/workflows/gh-pages.yml`) that builds and publishes the site to the `gh-pages` branch on every push to `main`.

Steps to use:

1. Push a commit to `main`. The Actions workflow will run, build, and publish the `dist` directory to the `gh-pages` branch.
2. In your repository settings -> Pages, set the source to `gh-pages` branch and optionally set a custom domain.

If you need a manual CLI deployment flow instead of Actions, use these commands locally:

```bash
npm run build
git checkout -b gh-pages
git add dist -f
git commit -m "Deploy site"
git subtree push --prefix dist origin gh-pages
```

Or use `gh-pages` package:

```bash
npm install -D gh-pages
npx gh-pages -d dist
```

Note on WebContainer behavior on GitHub Pages

- GitHub Pages is a static hosting service and does not let you set the Cross-Origin headers required for in-browser `@webcontainer/api`. Therefore the in-browser terminal/WebContainer features will **not** boot on GitHub Pages (you'll see the cross-origin isolation warning). Use `npm run dev` locally for WebContainer features during development, or deploy to a host where you can set COOP/COEP headers (or a reverse proxy that sets them).
