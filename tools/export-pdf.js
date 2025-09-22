// tools/export-pdf.js
import puppeteer from "puppeteer";
import { join } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const base = join(__dirname, "../public/legal");

const pages = [
  { file: "terms.html", pdf: "terms.pdf" },
  { file: "privacy.html", pdf: "privacy.pdf" },
  { file: "community.html", pdf: "community.pdf" },
  { file: "cookies.html", pdf: "cookies.pdf" }
];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for (const p of pages) {
    const url = `file://${join(base, p.file)}`;
    await page.goto(url, { waitUntil: "networkidle0" });
    await page.pdf({
      path: join(base, "pdf", p.pdf),
      format: "A4",
      printBackground: true
    });
    console.log(`✅ Exportado ${p.pdf}`);
  }

  await browser.close();
})();
