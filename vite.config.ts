import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the site from https://<user>.github.io/<repo>/.
// A relative base ('./') makes every asset URL relative to index.html, so the same build
// works at any sub-path (or at a domain root) without knowing the repository name.
// Routing uses the URL hash (#/classic), so refreshes and deep links never hit the server.
// To pin an absolute base instead, set VITE_BASE, e.g. VITE_BASE=/my-repo/ npm run build
export default defineConfig({
  base: process.env.VITE_BASE ?? './',
  plugins: [react()],
  build: { outDir: 'dist', sourcemap: false, chunkSizeWarningLimit: 900 },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
});
