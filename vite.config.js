import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { pathToFileURL } from 'url';

function getRequestBody(req) {
  if (req.body) return Promise.resolve(typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve(body);
      }
    });
    req.on('error', err => reject(err));
  });
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Injeta variáveis do .env no process.env para que a função serverless local acesse a GOOGLE_API_KEY
  Object.assign(process.env, env);

  return {
    plugins: [
      react(),
      {
        name: 'api-serverless-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const url = req.originalUrl || req.url;
            if (url && (url.startsWith('/api/gerar-plano') || url === '/api/gerar-plano')) {
              try {
                req.body = await getRequestBody(req);
                const filePath = path.resolve(process.cwd(), 'api/gerar-plano.js');
                const fileUrl = pathToFileURL(filePath).href;
                const handlerModule = await import(fileUrl);
                const handler = handlerModule.default;
                await handler(req, res);
              } catch (err) {
                console.error('[Vite API Middleware] Erro na rota /api/gerar-plano:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
            } else {
              next();
            }
          });
        }
      }
    ]
  };
});
