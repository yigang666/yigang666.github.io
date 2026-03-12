import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { LangProvider } from '../lib/i18n';
import Layout from '../components/Layout';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();
  return (
    <LangProvider>
      <Layout>
        <div key={pathname} className="page-enter">
          <Component {...pageProps} />
        </div>
      </Layout>
    </LangProvider>
  );
}
