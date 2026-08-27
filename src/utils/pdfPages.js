import fs from 'node:fs';
import path from 'node:path';

const PAGES_DIR = path.join(process.cwd(), 'public', 'assets', 'pages');

// public/assets/pages/<base>-1.jpg … を、ページ順に並べたURLの配列で返す
// (PDFビューアは埋め込み枠の中で倍率が安定しないため、ページ画像を並べて表示している)
export function pdfPageImages(base) {
    let files = [];
    try {
        files = fs.readdirSync(PAGES_DIR);
    } catch {
        return [];
    }
    return files
        .filter((f) => f.startsWith(`${base}-`) && f.endsWith('.jpg'))
        .map((f) => ({ file: f, n: Number(f.slice(base.length + 1, -4)) }))
        .sort((a, b) => a.n - b.n)
        .map(({ file }) => `/yohtanewwebsite/assets/pages/${file}`);
}
