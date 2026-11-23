import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { getBlogDir } from './parseContent';

/** Slugs of every full article body in content/blog/*.md */
export function getArticleSlugs(): string[] {
  const dir = getBlogDir();
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.md') && !f.endsWith('.en.md') && !f.endsWith('.zh.md'))
    .map(f => f.slice(0, -3));
}

export function articleExists(slug: string): boolean {
  return fs.existsSync(path.join(getBlogDir(), `${slug}.md`));
}

/**
 * Resolve the body file for a language.
 * Convention: <slug>.md is the default body (Chinese for current articles);
 * <slug>.en.md / <slug>.zh.md hold translations. Missing translation falls
 * back to the default body so older articles keep working.
 */
function resolveBodyFile(slug: string, lang: 'en' | 'zh'): string {
  const dir = getBlogDir();
  const translated = path.join(dir, `${slug}.${lang}.md`);
  if (fs.existsSync(translated)) return translated;
  return path.join(dir, `${slug}.md`);
}

/** Render a full article body (Markdown) to HTML. Frontmatter, if present, is stripped. */
export function getArticleHtml(slug: string, lang: 'en' | 'zh' = 'zh'): string {
  const raw = fs.readFileSync(resolveBodyFile(slug, lang), 'utf-8');
  const { content } = matter(raw);
  return marked.parse(content) as string;
}

/** Whether this article has a body written in the given language (not a fallback). */
export function hasArticleLang(slug: string, lang: 'en' | 'zh'): boolean {
  return fs.existsSync(path.join(getBlogDir(), `${slug}.${lang}.md`));
}
