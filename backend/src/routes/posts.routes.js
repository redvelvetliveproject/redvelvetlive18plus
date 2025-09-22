// backend/src/routes/posts.routes.js
import { Router } from 'express';
import Post from '../models/Post.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

// GET → Listar todos los posts
router.get('/', async (_req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).lean();
    return res.json({ ok: true, posts });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST → Crear nuevo post
router.post('/', auth, async (req, res) => {
  try {
    const { title, slug, summary, content } = req.body || {};
    if (!title || !slug || !content) {
      return res.status(400).json({ ok: false, error: 'Campos requeridos faltantes' });
    }

    const exists = await Post.findOne({ slug });
    if (exists) {
      return res.status(409).json({ ok: false, error: 'Slug ya existente' });
    }

    const post = await Post.create({ title, slug, summary, content });
    return res.status(201).json({ ok: true, post });
  } catch (err) {
    return res.status(400).json({ ok: false, error: err.message });
  }
});

// PUT → Editar post por slug
router.put('/:slug', auth, async (req, res) => {
  try {
    const { slug } = req.params;
    const updates = req.body;

    const post = await Post.findOneAndUpdate({ slug }, updates, { new: true });
    if (!post) {
      return res.status(404).json({ ok: false, error: 'Post no encontrado' });
    }

    return res.json({ ok: true, post });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
