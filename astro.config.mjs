import { defineConfig } from 'astro/config';
import { rm } from 'node:fs/promises';
import { isKnotHatReleased } from './src/utils/projectRelease.js';

export default defineConfig({
  // ユーザーページ (https://[username].github.io) として公開する場合:

  // プロジェクトページ (https://[username].github.io/[repo-name]) として公開する場合:
  site: 'https://ytap.github.io',
  base: '/yohtanewwebsite',
  integrations: [{
    name: 'scheduled-project-release',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        if (!isKnotHatReleased()) await rm(new URL('assets/Knot-hat.JPG', dir), { force: true });
      },
      'astro:server:setup': ({ server }) => {
        server.middlewares.use((req, res, next) => {
          if (!isKnotHatReleased() && req.url?.split('?')[0].endsWith('/assets/Knot-hat.JPG')) {
            res.statusCode = 404;
            res.end();
            return;
          }
          next();
        });
      },
    },
  }],
});
