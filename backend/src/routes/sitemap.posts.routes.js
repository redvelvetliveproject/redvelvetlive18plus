// backend/src/routes/sitemap.posts.routes.js
import { Router } from 'express';
import Post from '../models/Post.js'; // Usa tu modelo real de posts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Sitemap dinámico desde DB (si hay posts publicados).
 * Fallback: sitemap estático desde carpeta /frontend/public/client/blog
 */
router.get('/sitemap-posts.xml', async (_req, res) => {
  try {
    const SITE_URL = process.env.SITE_URL || 'https://www.redvelvetlive.com';

    // 1️⃣ Intentar cargar posts de la base de datos
    let posts = [];
    try {
      posts = await Post.find({ published: true })
        .sort({ updatedAt: -1 })
        .limit(200)
        .lean();
    } catch {
      posts = [];
    }

    if (posts.length > 0) {
      const xml =
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        posts.map(post => `
  <url>
    <loc>${SITE_URL}/blog/${post.slug}.html</loc>
    <lastmod>${(post.updatedAt || post.createdAt || new Date()).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n') +
        `\n</urlset>`;
      res.set('Content-Type', 'application/xml; charset=utf-8');
      return res.send(xml);
    }

    // 2️⃣ Fallback: generar a partir de archivos estáticos
    const repoRoot = path.resolve(__dirname, '..', '..');
    const BLOG_DIR = process.env.BLOG_DIR || path.join(repoRoot, 'frontend', 'public', 'client', 'blog');

    if (!fs.existsSync(BLOG_DIR)) {
      return res.status(200)
        .set('Content-Type', 'application/xml; charset=utf-8')
        .send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`);
    }

    const files = await fs.promises.readdir(BLOG_DIR);
    const pages = [];

    for (const file of files) {
      if (!file.endsWith('.html')) continue;
      const full = path.join(BLOG_DIR, file);
      const stat = await fs.promises.stat(full);

      const loc = `${SITE_URL}/client/blog/${encodeURIComponent(file)}`;
      const lastmod = stat.mtime.toISOString().slice(0, 10);
      pages.push({ loc, lastmod, changefreq: 'weekly', priority: '0.7' });
    }

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      pages.map(p => `
  <url>
    <loc>${p.loc}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n') +
      `\n</urlset>`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(xml);
  } catch (err) {
    console.error('[sitemap-posts] error:', err);
    return res.status(500).send('Internal error');
  }
});

export default router;
