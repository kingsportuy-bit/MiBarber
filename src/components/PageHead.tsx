import Head from 'next/head';
import { useEffect } from 'react';

interface PageHeadProps {
  title: string;
}

export function PageHead({ title }: PageHeadProps) {
  useEffect(() => {
    document.title = `MiBarber | ${title}`;
  }, [title]);

  return (
    <Head>
      <title>MiBarber | {title}</title>
    </Head>
  );
}