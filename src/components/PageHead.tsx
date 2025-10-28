import Head from 'next/head';
import { useEffect } from 'react';

interface PageHeadProps {
  title: string;
}

export function PageHead({ title }: PageHeadProps) {
  useEffect(() => {
    document.title = `Barberox | ${title}`;
  }, [title]);

  return (
    <Head>
      <title>Barberox | {title}</title>
    </Head>
  );
}