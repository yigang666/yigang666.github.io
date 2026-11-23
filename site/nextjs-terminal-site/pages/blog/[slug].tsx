import Head from 'next/head';
import Link from 'next/link';
import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { parseContent, getContentPath, type BlogPost } from '../../lib/parseContent';
import { getArticleHtml, getArticleSlugs } from '../../lib/articles';
import { useLang, t } from '../../lib/i18n';

interface ArticlePageProps {
  post: BlogPost;
  htmlEn: string;
  htmlZh: string;
}

const ArticlePage: NextPage<ArticlePageProps> = ({ post, htmlEn, htmlZh }) => {
  const { lang } = useLang();
  const T = t[lang].blog;
  const title = lang === 'zh' ? (post.title_zh || post.title) : post.title;
  const html = lang === 'zh' ? htmlZh : htmlEn;

  return (
    <>
      <Head>
        <title>{title} — Yigang Li</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="max-w-3xl mx-auto px-8 py-20">
        <Link href="/blog" className="text-[#19c37d] text-sm hover:underline">
          ← {T.back_to_blog}
        </Link>

        <article className="mt-10">
          <time className="text-[#555] text-xs font-mono">{post.date}</time>
          <h1 className="text-white font-bold text-3xl mt-3 mb-4 leading-snug">{title}</h1>
          <div className="flex flex-wrap gap-2 mb-10">
            {post.tags.map(tag => (
              <span key={tag} className="text-[#555] text-xs px-2.5 py-1 bg-[#111] border border-[#1e1e1e] font-mono">{tag}</span>
            ))}
          </div>

          <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />
        </article>

        <div className="border-t border-[#1a1a1a] mt-16 pt-8">
          <Link href="/blog" className="text-[#19c37d] text-sm hover:underline">
            ← {T.back_to_blog}
          </Link>
        </div>
      </div>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const content = parseContent(getContentPath());
  const paths = content.blog
    .filter(post => post.slug && post.hasBody)
    .map(post => ({ params: { slug: post.slug as string } }));
  // Also cover body files not yet listed in content.md (listed entries take precedence for metadata).
  for (const slug of getArticleSlugs()) {
    if (!paths.some(p => p.params.slug === slug)) {
      // No metadata entry: skip — detail pages need a content.md entry.
    }
  }
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<ArticlePageProps> = async ({ params }) => {
  const slug = params?.slug as string;
  const content = parseContent(getContentPath());
  const post = content.blog.find(p => p.slug === slug);
  if (!post || !post.hasBody) return { notFound: true };
  return { props: { post, htmlEn: getArticleHtml(slug, 'en'), htmlZh: getArticleHtml(slug, 'zh') } };
};

export default ArticlePage;
