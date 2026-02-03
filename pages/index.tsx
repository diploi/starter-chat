import { useState } from 'react';
import { getSupabase } from '@/lib/supabaseClient';

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (
    type: 'LOGIN' | 'SIGNUP',
    email: string,
    userPassword: string,
  ) => {
    try {
      const supabase = await getSupabase();
      const {
        error,
        data: { user },
      } =
        type === 'LOGIN'
          ? await supabase.auth.signInWithPassword({
              email,
              password: userPassword,
            })
          : await supabase.auth.signUp({ email, password: userPassword });
      if (error) {
        window.alert('Error with auth: ' + error.message);
      } else if (!user) {
        window.alert(
          'Signup successful, confirmation mail should be sent soon!',
        );
      }
    } catch (error: unknown) {
      console.log('error', error);
      if (error && typeof error === 'object' && 'error_description' in error) {
        const { error_description } = error as { error_description?: string };
        window.alert(error_description ?? String(error));
      } else {
        window.alert(String(error));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900/70 backdrop-blur-xl shadow-2xl">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-sky-400/20 via-transparent to-indigo-400/20" />
          <div className="relative z-10 space-y-8 p-8">
            <header className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
                Starter Chat
              </p>
              <h1 className="text-3xl font-semibold">Welcome back</h1>
              <p className="text-sm text-slate-400">
                Sign in to continue collaborating with your team.
              </p>
            </header>

            <div className="space-y-5">
              <label className="block space-y-2 text-sm">
                <span className="font-medium text-slate-100">Email</span>
                <input
                  type="email"
                  className="w-full rounded-2xl border border-slate-700 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-400 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                  placeholder="you@example.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </label>

              <label className="block space-y-2 text-sm">
                <span className="font-medium text-slate-100">Password</span>
                <input
                  type="password"
                  className="w-full rounded-2xl border border-slate-700 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-400 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleLogin('LOGIN', username, password)}
                className="w-full rounded-2xl bg-sky-400 px-4 py-3 text-center font-semibold text-slate-950 transition hover:bg-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => handleLogin('SIGNUP', username, password)}
                className="w-full rounded-2xl border border-slate-700 bg-transparent px-4 py-3 text-center font-semibold text-slate-100 transition hover:border-sky-400/60 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
              >
                Create an account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
