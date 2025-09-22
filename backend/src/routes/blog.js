// backend/src/routes/blog.js
import express from 'express';
import Post from '../models/Post.js';
const router = express.Router();

// GET /blog/:slug.html
router.get('/:slug.html', async (req, res) => {
  try {
    const slug = req.params.slug;
    const post = await Post.findOne({ slug });
    if (!post) return res.status(404).send('Post no encontrado');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title} – RedVelvetLive</title>
  <meta name="description" content="${post.summary || ''}">
  <link rel="canonical" href="https://www.redvelvetlive.com/blog/${slug}.html" />
  <meta property="og:title" content="${post.title}" />
  <meta property="og:description" content="${post.summary || ''}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://www.redvelvetlive.com/blog/${slug}.html" />
</head>
<body>
  <header><a href="/index.html">← Volver a RedVelvetLive</a></header>
  <main class="main-container">
    <article class="panel">
      <h1>${post.title}</h1>
      <p class="muted"><small>Publicado el ${new Date(post.updatedAt || post.createdAt).toLocaleDateString()}</small></p>
      <div class="post-body">${post.content}</div>
    </article>
  </main>
  <footer class="site-footer"><a href="/blog.html">Ver más artículos</a></footer>
</body>
</html>`);
  } catch (e) {
    res.status(500).send('Error al cargar el post');
  }
});

export default router;
