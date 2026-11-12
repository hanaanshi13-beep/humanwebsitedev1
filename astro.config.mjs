import { defineConfig } from 'astro/config';

// Static output. No adapter, no analytics, no third-party scripts.
export default defineConfig({
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
