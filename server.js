// 🚀 SERVER.JS - Servidor de Desenvolvimento Local
// Substitui o comando Python para melhor compatibilidade

import { createServer } from 'http';
import { readFile, readdir } from 'fs/promises';
import { extname, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 8000;
const PUBLIC_DIR = join(__dirname, 'pages');

// MIME Types
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

// Content Security Policy Header
const CSP_HEADER = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; img-src 'self' data: blob: https:; font-src 'self' https://cdnjs.cloudflare.com; connect-src 'self' https://*.supabase.co;";

const server = createServer(async (req, res) => {
  try {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Security Headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Security-Policy', CSP_HEADER);

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Parse URL
    let url = req.url === '/' ? '/pet-social-signup.html' : req.url;
    
    // Handle SPA routing
    if (!url.includes('.')) {
      url = '/pet-social-signup.html';
    }

    // Security: Prevent directory traversal
    if (url.includes('..')) {
      res.writeHead(400);
      res.end('Bad Request');
      return;
    }

    const filePath = join(PUBLIC_DIR, url);
    const ext = extname(filePath).toLowerCase();
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

    try {
      const data = await readFile(filePath);
      
      res.writeHead(200, {
        'Content-Type': mimeType,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000'
      });
      res.end(data);
      
    } catch (error) {
      // Try to serve 404.html
      try {
        const notFoundPage = await readFile(join(PUBLIC_DIR, '404.html'));
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(notFoundPage);
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head><title>404 - Página Não Encontrada</title></head>
          <body>
            <h1>404 - Página Não Encontrada</h1>
            <p><a href="/pet-social-signup.html">Voltar para PetSocial</a></p>
          </body>
          </html>
        `);
      }
    }

  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head><title>500 - Erro do Servidor</title></head>
      <body>
        <h1>500 - Erro Interno do Servidor</h1>
        <p>Tente novamente mais tarde.</p>
      </body>
      </html>
    `);
  }
});

server.listen(PORT, () => {
  console.log(`🚀 PetSocial Server running at http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${PUBLIC_DIR}`);
  console.log(`🐾 Open your browser and navigate to: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
