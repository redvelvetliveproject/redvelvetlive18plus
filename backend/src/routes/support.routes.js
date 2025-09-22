// backend/src/routes/sitemap.posts.js
import { Router } from 'express';

const router = Router();

// GET /sitemap-posts.xml  -> usa tu DB real cuando la tengas
router.get('/sitemap-posts.xml', async (_req, res) => {
  // Ejemplo de items mock:
  const posts = [
    { url: 'https://www.redvelvetlive.com/posts/introduccion-redvelvetlive.html', lastmod: '2025-08-16' },
    { url: 'https://www.redvelvetlive.com/posts/guia-principiante-timido.html', lastmod: '2025-08-10' },
    { url: 'https://www.redvelvetlive.com/posts/seguridad-operacional-modelos.html', lastmod: '2025-08-02' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${posts.map(p => `  <url>
    <loc>${p.url}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`).join('\n')}
</urlset>`;

  res.set('Content-Type', 'application/xml').send(xml);
});

export default router;
