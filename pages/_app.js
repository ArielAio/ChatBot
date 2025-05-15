import { useEffect } from 'react';
import Head from 'next/head';
import { GoogleOAuthProvider } from '@react-oauth/google';
import "@/styles/globals.css";
import "@/styles/mobile.css";

export default function App({ Component, pageProps }) {
  // Obtendo a CLIENT_ID do Google do ambiente
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Otimização: Carregar fontes de forma eficiente
  useEffect(() => {
    if ('fonts' in document) {
      Promise.all([
        document.fonts.load('1em Inter'),
        document.fonts.load('1em Roboto')
      ]).then(() => {
        document.documentElement.classList.add('fonts-loaded');
      });
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="theme-color" content="#1F2937" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </Head>
      <Component {...pageProps} />
    </GoogleOAuthProvider>
  );
}
