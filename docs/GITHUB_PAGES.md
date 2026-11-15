# GitHub Pages deployment

Wave is a static Vite/React application. The repository deploys the production frontend to GitHub Pages from the `main` branch after the functional CI build and browser-test job succeeds.

## Published site

- URL: [https://iamjpsonkar.github.io/Wave/](https://iamjpsonkar.github.io/Wave/)
- Source branch: `main`
- Build output: `dist/`
- Deployment workflow: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)
- Build tool: Vite with `GITHUB_PAGES=true`, which sets the project-site asset base to `/Wave/`.

Pull requests run the functional CI checks but do not publish a site. A push to `main` runs the same functional gate, creates a Pages-specific production build, checks that script and stylesheet URLs use the `/Wave/` prefix, uploads the Pages artifact, and deploys it in the `github-pages` environment. A failed functional gate prevents deployment.

## One-time repository setup

1. Open the Wave repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Save the setting if GitHub presents a save control.
5. Confirm the repository allows GitHub Actions to run and the `github-pages` environment is not blocked by an unexpected approval rule.

The deployment job uses the narrowly scoped `pages: write` and `id-token: write` permissions required by GitHub's Pages deployment action. No personal access token, deploy key, third-party hosting account or application secret is required.

## Local build behavior

The Pages path is conditional and does not change local or Docker hosting:

- `npm run build` normally emits root-relative asset URLs for local/self-hosted hosting.
- `GITHUB_PAGES=true npm run build` emits URLs rooted at `/Wave/` for this repository's project Pages site.
- The Pages build is checked in CI before its artifact is uploaded.

Do not hard-code `/Wave/` as the default Vite base; doing so would break the existing root-path Docker deployment.

## Application and privacy boundaries

GitHub Pages serves only Wave's static frontend. It does not provide an API, database, account system, collaboration, remote workspace or document upload. Users continue to select a folder on their own device through the browser File System Access API. Use a supported Chromium-based browser and the HTTPS Pages origin. User documents are not uploaded to GitHub Pages by this deployment.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Deployment job says Pages is not enabled | Set **Settings → Pages → Source** to **GitHub Actions** |
| Site opens but JS/CSS assets return 404 | Confirm the build ran with `GITHUB_PAGES=true` and the generated URLs start with `/Wave/` |
| A new commit does not deploy | Check the functional build job first; deployment is gated on its success and only runs for pushes to `main` |
| Browser cannot select a folder | Use a supported Chromium browser; Pages already provides HTTPS, but browser API support and user permission are still required |
| Site appears stale | Hard-refresh the browser and inspect the deployment URL/output in the `github-pages` environment |

## Verification status

The workflow and Vite configuration are source changes until the first exact-main-commit GitHub Actions run succeeds. A green deployment job and a browser smoke test on the published URL are required before describing the site as live and verified.
