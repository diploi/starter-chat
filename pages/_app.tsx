import '~/styles/style.scss';
import type { AppProps } from 'next/app';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import UserContext, { type AppUser } from 'lib/UserContext';
import { getSupabase } from 'lib/supabaseClient';
import { jwtDecode } from 'jwt-decode';
import type { Session } from '@supabase/supabase-js';

interface AccessTokenPayload {
  user_role?: string;
}

export default function ChatApp({ Component, pageProps }: AppProps) {
  const [userLoaded, setUserLoaded] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    let authUnsubscribe: (() => void) | null = null;

    const saveSession = (sessionValue: Session | null) => {
      if (!isMounted) return;
      setSession(sessionValue);
      const currentUser = (sessionValue?.user as AppUser | undefined) ?? null;
      if (sessionValue && currentUser) {
        const jwt = jwtDecode<AccessTokenPayload>(sessionValue.access_token);
        currentUser.appRole = jwt.user_role;
      }
      setUser(currentUser);
      setUserLoaded(!!currentUser);
      if (currentUser) {
        router.push('/channels/[id]', '/channels/1');
      }
    };

    (async () => {
      try {
        const supabase = await getSupabase();
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();
        saveSession(initialSession);

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, authSession) => {
          saveSession(authSession);
        });
        authUnsubscribe = () => subscription.unsubscribe();
      } catch (error) {
        console.error('Failed to initialise Supabase auth', error);
      }
    })();

    return () => {
      isMounted = false;
      if (authUnsubscribe) authUnsubscribe();
    };
  }, [router]);

  const signOut = async () => {
    const supabase = await getSupabase();
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push('/');
    }
  };

  return (
    <UserContext.Provider
      value={{
        userLoaded,
        user,
        signOut,
        authLoaded: userLoaded,
      }}
    >
      <Component {...pageProps} />
    </UserContext.Provider>
  );
}
