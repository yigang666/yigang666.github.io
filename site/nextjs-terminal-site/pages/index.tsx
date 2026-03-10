import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Terminal from '../components/Terminal';
import { parseResume, getResumePath, type ResumeData } from '../lib/parseResume';

interface HomeProps {
  resumeData: ResumeData;
}

const Home: NextPage<HomeProps> = ({ resumeData }) => {
  return (
    <>
      <Head>
        <title>Yigang Li — DevOps Portfolio</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Yigang Li — DevOps Engineer portfolio. Terminal-style interface with live CI/CD dashboard."
        />
        <meta name="robots" content="index, follow" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="h-screen bg-black overflow-hidden">
        <Terminal resumeData={resumeData} />
      </main>
    </>
  );
};

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const resumePath = getResumePath();
  const resumeData = parseResume(resumePath);

  return {
    props: {
      resumeData,
    },
  };
};

export default Home;
