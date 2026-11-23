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
    .filter(f => f.endsWith('.md'))
    .map(f => f.slice(0, -3));
}

export function articleExists(slug: string): boolean {
  return fs.existsSync(path.join(getBlogDir(), `${slug}.md`));
}

/** Render a full article body (Markdown) to HTML. Frontmatter, if present, is stripped. */
export function getArticleHtml(slug: string): string {
  const raw = fs.readFileSync(path.join(getBlogDir(), `${slug}.md`), 'utf-8');
  const { content } = matter(raw);
  return marked.parse(content) as string;
}
