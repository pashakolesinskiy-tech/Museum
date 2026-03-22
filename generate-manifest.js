#!/usr/bin/env node
/**
 * generate-manifest.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Сканирует папки assets/bw/img/ и assets/bw/video/ и генерирует
 * файл assets/bw/manifest.json, который используется сайтом для
 * динамической загрузки галереи.
 *
 * Запуск:
 *   node generate-manifest.js
 *
 * После запуска откройте assets/bw/manifest.json и вручную заполните
 * поля "caption" и "alt" для каждого элемента.
 *
 * Соглашение об именовании файлов:
 *   photo1.webp          — чёрно-белое фото (обложка)
 *   photo1color.webp     — цветная версия того же фото (если есть → тип "color")
 *   video1.mp4           — видео для photo1 (если есть → тип "video")
 *   Приоритет: video > color > image (только фото, без эффектов)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const fs   = require("fs");
const path = require("path");

// ── Настройки ────────────────────────────────────────────────────────────────
const IMG_DIR      = path.join(__dirname, "assets", "bw", "img");
const VIDEO_DIR    = path.join(__dirname, "assets", "bw", "video");
const MANIFEST_OUT = path.join(__dirname, "assets", "bw", "manifest.json");

const IMG_EXTS   = [".webp", ".jpg", ".jpeg", ".png", ".avif"];
const VIDEO_EXTS = [".mp4", ".webm", ".ogg"];
// ─────────────────────────────────────────────────────────────────────────────

function listFiles(dir, exts) {
  if (!fs.existsSync(dir)) {
    console.warn(`⚠  Папка не найдена: ${dir}`);
    return [];
  }
  return fs.readdirSync(dir).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return exts.includes(ext);
  });
}

function run() {
  const imgFiles   = listFiles(IMG_DIR, IMG_EXTS);
  const videoFiles = listFiles(VIDEO_DIR, VIDEO_EXTS);

  // Собираем индексы видео: "1" → "video1.mp4"
  const videoMap = {};
  for (const f of videoFiles) {
    const m = f.match(/^(?:video|photo)?(\d+)\./i);
    if (m) videoMap[m[1]] = f;
  }

  // Собираем базовые чёрно-белые фото (без суффикса "color")
  const bwPhotos = imgFiles
    .filter((f) => !/color\./i.test(f))
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/) || [0]) || 0;
      const nb = parseInt(b.match(/\d+/) || [0]) || 0;
      return na - nb;
    });

  // Собираем цветные версии: "photo5color.webp" → index "5"
  const colorMap = {};
  for (const f of imgFiles) {
    const m = f.match(/^(?:photo)?(\d+)color\./i);
    if (m) colorMap[m[1]] = f;
  }

  const items = [];

  for (const bwFile of bwPhotos) {
    const numMatch = bwFile.match(/\d+/);
    const idx      = numMatch ? numMatch[0] : null;

    const hasVideo = idx && videoMap[idx];
    const hasColor = idx && colorMap[idx];

    let type, item;

    if (hasVideo) {
      // ── Тип «video» ───────────────────────────────────────────────────────
      type = "video";
      item = {
        type,
        poster:  `assets/bw/img/${bwFile}`,
        video:   `assets/bw/video/${videoMap[idx]}`,
        caption: "",          // ← заполните вручную
        alt:     `Чёрно-белое фото ${idx}`,
      };
    } else if (hasColor) {
      // ── Тип «color» ───────────────────────────────────────────────────────
      type = "color";
      item = {
        type,
        poster:   `assets/bw/img/${bwFile}`,
        colorSrc: `assets/bw/img/${colorMap[idx]}`,
        caption:  "",
        alt:      `Чёрно-белое фото ${idx}`,
        altColor: `Цветная версия фото ${idx}`,
      };
    } else {
      // ── Тип «image» ───────────────────────────────────────────────────────
      type = "image";
      item = {
        type,
        src:     `assets/bw/img/${bwFile}`,
        caption: "",
        alt:     `Фото ${idx || bwFile}`,
      };
    }

    items.push(item);
  }

  // Если папка совсем пустая — кладём заглушку
  if (items.length === 0) {
    console.warn("⚠  Фотографии не найдены. Manifest будет пустым.");
  }

  const manifest = { items };
  fs.mkdirSync(path.dirname(MANIFEST_OUT), { recursive: true });
  fs.writeFileSync(MANIFEST_OUT, JSON.stringify(manifest, null, 2), "utf8");

  console.log(`✅  Создан manifest.json — ${items.length} элемент(ов)`);
  console.log(`   Путь: ${MANIFEST_OUT}`);
  console.log("");
  console.log("👉  Откройте assets/bw/manifest.json и заполните поля");
  console.log('   "caption" и "alt" для каждого элемента.');
}

run();
