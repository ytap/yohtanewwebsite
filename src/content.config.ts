import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// プロジェクト1件 = src/content/projects/ のMarkdown1枚。
// トップのグリッドも個別ページも、すべてここから読む。
const projects = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
    schema: z.object({
        title: z.string(),
        contributors: z.string(),
        // 「2026」「2025–2026」など、表示したい文字列をそのまま書く
        year: z.string(),
        // 年の隣に出す関わり方。例: "Solo project" / "Role: Interaction design, concept co-creation"
        role: z.string().optional(),
        // 1行説明。トップのhoverと、ページ右上の両方で使う
        oneLiner: z.string(),

        // トップでの並び順 (小さいほど先。1番目が左の大きい枠になる)
        order: z.number(),
        // ページがまだ無い作品はfalseにしておくと、トップからリンクされない
        published: z.boolean().default(true),

        // 画像が横長すぎて切りたくない場合は 'contain' にする
        fit: z.enum(['cover', 'contain']).default('cover'),

        // ループ再生する短い動画と、その静止画 (動画が無い間は静止画だけでも動く)
        loop: z.string().optional(),
        poster: z.string(),

        // 30秒のアーカイブ動画と、フル尺へのリンク
        archiveVideo: z.string().optional(),
        fullVideoUrl: z.string().url().optional(),

        // WhyとWhatに答える簡潔なコンセプト。YAMLの | で複数段落書ける
        concept: z.string(),
        // 技術的な実装。箇条書きで1項目1行
        technical: z.array(z.string()).default([]),
        // クレジット
        credits: z.string(),

        // Recognitionの下、Processの上に置く補足画像
        extraImage: z.string().optional(),
        extraCaption: z.string().optional(),

        // Creditsの下に埋め込む論文PDF (public/assets/ 以下のパス)
        paper: z.string().optional(),

        // 受賞・論文など。textが本文、urlがあればリンクになる
        recognition: z.array(z.object({
            text: z.string(),
            url: z.string().url().optional(),
        })).default([]),
    }),
});

export const collections = { projects };
