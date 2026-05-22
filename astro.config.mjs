import { defineConfig } from 'astro/config';

export default defineConfig({
  // ユーザーページ (https://[username].github.io) として公開する場合:

  // プロジェクトページ (https://[username].github.io/[repo-name]) として公開する場合:
  site: 'https://ytap.github.io',
  base: '/yohtanewwebsite',
});