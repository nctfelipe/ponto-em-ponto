import type { VitePWAOptions } from 'vite-plugin-pwa';

export const pwaConfig = {
  includeAssets: ['apple-touch-icon.png'],
  manifest: {
    id: '/',
    name: 'Ponto em Ponto',
    short_name: 'p-em-p',
    description: 'Registro e acompanhamento de ponto.',
    lang: 'pt-BR',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#ffffff',
    icons: [
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: 'pwa-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  },
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{css,html,ico,js,svg,woff2}'],
  },
} satisfies Partial<VitePWAOptions>;
