import "@/styles/globals.css";
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function App({ Component, pageProps }) {
  // Obtém o Client ID do Google das variáveis de ambiente ou usa um valor padrão (para desenvolvimento)
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "SEU_GOOGLE_CLIENT_ID";
  
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Component {...pageProps} />
    </GoogleOAuthProvider>
  );
}
