import Head from 'next/head';
import Link from 'next/link';
import type { GetStaticProps, NextPage } from 'next';
import { parseContent, getContentPath, type BlogPost } from '../lib/parseContent';
import { useLang, t } from '../lib/i18n';

interface BlogPageProps {
  posts: BlogPost[];
}

const Blog: NextPage<BlogPageProps> = ({ posts }) => {
  const { lang } = useLang();
  const T = t[lang].blog;

  return (
    <>
      <Head>
        <title>{T.title} — Yigang Li</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="max-w-3xl mx-auto px-8 py-20">
        <h1 className="text-4xl font-bold text-white tracking-tight mb-3">{T.title}</h1>
        <p className="text-[#a0a0a0] text-sm mb-16">{T.subtitle}</p>

        <div className="space-y-0">
          {posts.map((post, i) => {
            const title = lang === 'zh' ? (post.title_zh || post.title) : post.title;
            const summary = lang === 'zh' ? (post.summary_zh || post.summary) : post.summary;
            return (
              <div key={i}>
                <article className="py-8">
                  <time className="text-[#555] text-xs font-mono">{post.date}</time>
                  <h2 className="text-white font-semibold text-lg mt-2 mb-3 leading-snug">
                    {post.hasBody && post.slug ? (
                      <Link href={`/blog/${post.slug}`} className="hover:text-[#19c37d] transition-colors">
                        {title}
                      </Link>
                    ) : (
                      title
                    )}
                  </h2>
                  <p className="text-[#a0a0a0] text-sm leading-relaxed mb-4">{summary}</p>
                  {post.hasBody && post.slug && (
                    <Link href={`/blog/${post.slug}`} className="text-[#19c37d] text-sm hover:underline">
                      {T.read_full} →
                    </Link>
                  )}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-[#555] text-xs px-2.5 py-1 bg-[#111] border border-[#1e1e1e] font-mono">{tag}</span>
                    ))}
                  </div>
                </article>
                {i < posts.length - 1 && <div className="border-t border-[#1a1a1a]" />}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps<BlogPageProps> = async () => {
  const content = parseContent(getContentPath());
  return { props: { posts: content.blog } };
};

export default Blog;
