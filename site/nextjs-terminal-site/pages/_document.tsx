import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  const plausibleEndpoint = process.env.NEXT_PUBLIC_PLAUSIBLE_ENDPOINT || 'https://plausible.io';
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || '';

  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Yigang Li — DevOps Engineer portfolio" />
        <meta name="theme-color" content="#0a0a0a" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap"
          as="style"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
        {plausibleDomain && (
          <script
            defer
            data-domain={plausibleDomain}
            src={`${plausibleEndpoint}/js/script.js`}
          />
        )}
      </Head>
      <body style={{ background: '#0a0a0a' }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
