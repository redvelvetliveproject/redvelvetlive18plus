// backend/src/routes/sitemap.posts.routes.js
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// ============================
//  Configuración del sitemap
// ============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorio donde se guardará el sitemap (puede adaptarse)
const sitemapDir = path.resolve(__dirname, "../../public");
const sitemapFile = path.join(sitemapDir, "sitemap.xml");

// Ejemplo básico de datos (puedes conectarlo luego con MongoDB)
const posts = [
  {
    id: 1,
    title: "Bienvenida a RedVelvetLive",
    url: "https://redvelvetlive.com/blog/bienvenida",
    lastmod: "2025-10-05",
  },
  {
    id: 2,
    title: "Cómo funciona el sistema de pagos con ONECOP",
    url: "https://redvelvetlive.com/blog/onecop-pagos",
    lastmod: "2025-10-01",
  },
];

// ============================
//  Generar Sitemap dinámico
// ============================
router.get("/generate-sitemap", async (req, res) => {
  try {
    if (!fs.existsSync(sitemapDir)) fs.mkdirSync(sitemapDir, { recursive: true });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${posts
  .map(
    (p) => `
  <url>
    <loc>${p.url}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    fs.writeFileSync(sitemapFile, xml);
    return res.status(200).json({
      ok: true,
      message: "✅ Sitemap generado correctamente",
      file: sitemapFile,
    });
  } catch (error) {
    console.error("Error al generar el sitemap:", error);
    return res.status(500).json({ ok: false, error: "Error interno del servidor" });
  }
});

// ============================
//  Obtener Sitemap XML
// ============================
router.get("/sitemap.xml", (req, res) => {
  try {
    if (!fs.existsSync(sitemapFile)) {
      return res.status(404).send("Sitemap no encontrado. Genera uno con /generate-sitemap");
    }

    res.setHeader("Content-Type", "application/xml");
    fs.createReadStream(sitemapFile).pipe(res);
  } catch (error) {
    console.error("Error al leer el sitemap:", error);
    res.status(500).json({ ok: false, error: "Error interno del servidor" });
  }
});

// ============================
//  Rutas básicas del Blog
// ============================
router.get("/posts", (req, res) => {
  res.json({ ok: true, count: posts.length, data: posts });
});

router.get("/posts/:id", (req, res) => {
  const post = posts.find((p) => p.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ ok: false, message: "Post no encontrado" });
  res.json({ ok: true, data: post });
});

export default router;
