import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages project sites are served from /<repository-name>/; local and Docker
// deployments remain rooted at / unless the Pages build flag is explicitly enabled.
const base = process.env.GITHUB_PAGES === 'true' ? '/Wave/' : '/';

export default defineConfig({ base, plugins: [react()] });
