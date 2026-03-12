import Head from 'next/head';
import type { GetStaticProps, NextPage } from 'next';
import { parseContent, getContentPath, type ContactData } from '../lib/parseContent';
import { useLang, t } from '../lib/i18n';

interface ContactPageProps {
  contact: ContactData;
}

const Contact: NextPage<ContactPageProps> = ({ contact }) => {
  const { lang } = useLang();
  const T = t[lang].contact;

  const items = [
    { label: T.email, value: contact.email, href: `mailto:${contact.email}` },
    { label: 'LinkedIn', value: contact.linkedin.replace('https://', ''), href: contact.linkedin },
    { label: 'GitHub', value: contact.github.replace('https://', ''), href: contact.github },
    { label: T.phone, value: contact.phone, href: null },
  ];

  return (
    <>
      <Head>
        <title>{T.title} — Yigang Li</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="max-w-2xl mx-auto px-8 py-20">
        <h1 className="text-4xl font-bold text-white tracking-tight mb-3">{T.title}</h1>
        <p className="text-[#a0a0a0] text-sm mb-16 leading-relaxed">{T.subtitle}</p>

        <a
          href={`mailto:${contact.email}`}
          className="inline-block px-5 py-2.5 bg-white text-black text-sm font-semibold hover:bg-gray-100 transition-colors mb-16"
        >
          {T.cta}
        </a>

        <div className="border-t border-[#1a1a1a]">
          {items.map(item => (
            <div key={item.label} className="flex items-center justify-between py-5 border-b border-[#1a1a1a]">
              <span className="text-[#555] text-sm w-24">{item.label}</span>
              {item.href ? (
                <a
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="text-[#f5f5f5] text-sm hover:text-white transition-colors"
                >
                  {item.value}
                </a>
              ) : (
                <span className="text-[#f5f5f5] text-sm">{item.value}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps<ContactPageProps> = async () => {
  const content = parseContent(getContentPath());
  return { props: { contact: content.contact } };
};

export default Contact;
