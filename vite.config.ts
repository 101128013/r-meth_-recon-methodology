import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: env.BASE_URL || './',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        {
          name: 'configure-response-headers',
          configureServer: (server) => {
            server.middlewares.use((req, res, next) => {
              try {
                // Only set COOP/COEP headers for HTML pages. Avoid setting them
                // for assets, WS upgrades, or other endpoints as this can break
                // HMR WebSocket connections or route upgrades.
                const accept = req.headers?.accept || '';
                const url = req.url || '';
                const isHtmlRequest = accept.includes('text/html') || url === '/' || url.endsWith('.html');
                const isUpgrade = !!(req.headers && (req.headers['upgrade'] || req.headers['sec-websocket-key']));
                if (isHtmlRequest && !isUpgrade) {
                  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
                  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
                }
              } catch (err) {
                // Don't throw — log and continue. Leaving middleware silent if errors occur.
                // If Node console available, print error so debugging is easier.
                // eslint-disable-next-line no-console
                console.error('Failed to set COOP/COEP headers:', err);
              }
              next();
            });
          },
          configurePreviewServer: (server) => {
            server.middlewares.use((req, res, next) => {
              try {
                const accept = req.headers?.accept || '';
                const url = req.url || '';
                const isHtmlRequest = accept.includes('text/html') || url === '/' || url.endsWith('.html');
                const isUpgrade = !!(req.headers && (req.headers['upgrade'] || req.headers['sec-websocket-key']));
                if (isHtmlRequest && !isUpgrade) {
                  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
                  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
                }
              } catch (err) {
                // eslint-disable-next-line no-console
                console.error('Failed to set COOP/COEP headers (preview):', err);
              }
              next();
            });
          }
        }
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
