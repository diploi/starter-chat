import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import UserContext, { type AppUser } from '@/lib/UserContext';
import { getSupabase } from '@/lib/supabaseClient';
import { jwtDecode } from 'jwt-decode';
import type { Session } from '@supabase/supabase-js';

interface AccessTokenPayload {
  user_role?: string;
}

export default function App({ Component, pageProps }: AppProps) {
  const [userLoaded, setUserLoaded] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const redirectedRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    let authUnsubscribe: (() => void) | null = null;

    const saveSession = (sessionValue: Session | null) => {
      if (!isMounted) return;
      if (sessionRef.current?.access_token === sessionValue?.access_token) {
        return;
      }
      sessionRef.current = sessionValue;
      setSession(sessionValue);

      // Ensure realtime connections use the latest JWT so channel subscriptions deliver events
      void (async () => {
        try {
          const supabase = await getSupabase();
          supabase.realtime.setAuth(sessionValue?.access_token ?? '');
        } catch (error) {
          console.error('Failed to update realtime auth token', error);
        }
      })();

      const currentUser = (sessionValue?.user as AppUser | undefined) ?? null;
      if (sessionValue && currentUser) {
        const jwt = jwtDecode<AccessTokenPayload>(sessionValue.access_token);
        currentUser.appRole = jwt.user_role;
      }
      setUser(currentUser);
      setUserLoaded(!!currentUser);
      if (currentUser) {
        const isChannelRoute = router.pathname.startsWith('/channels');
        if (!isChannelRoute && !redirectedRef.current) {
          redirectedRef.current = true;
          router.push('/channels/[id]', '/channels/1').catch((error) => {
            console.error('Navigation failed', error);
            redirectedRef.current = false;
          });
        }
      }
      if (!currentUser) redirectedRef.current = false;
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
      supabase.realtime.setAuth('');
      redirectedRef.current = false;
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
