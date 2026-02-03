import Head from 'next/head';
import Link from 'next/link';
import { useContext } from 'react';
import UserContext, { type AppUser } from '@/lib/UserContext';
import { addChannel, deleteChannel, type Channel } from '@/lib/Store';
import TrashIcon from '@/components/TrashIcon';
import type { ReactNode } from 'react';

interface LayoutProps {
  channels: Channel[];
  activeChannelId?: number | string | string[];
  children: ReactNode;
}

export default function Layout({
  channels,
  activeChannelId,
  children,
}: LayoutProps) {
  const { signOut, user } = useContext(UserContext);

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const newChannel = async () => {
    const slug = window.prompt('Please enter your name');
    if (slug && user) {
      addChannel(slugify(slug), user.id);
    }
  };

  return (
    <>
      <Head>
        <title>Chat App</title>
      </Head>
      <main className="main flex min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
        <nav className="relative flex w-72 min-w-[14rem] max-w-sm flex-col border-r border-slate-800/60 bg-slate-950/80 text-slate-100 backdrop-blur-xl">
          <div className="sticky top-0 z-10 border-b border-slate-800/60 bg-slate-950/90 px-6 py-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Diploi
                </p>
                <h2 className="text-xl font-semibold">Workspace</h2>
              </div>
              <button
                className="w-full rounded-2xl bg-sky-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                onClick={() => newChannel()}
              >
                New Channel
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
            <section className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
                Account
              </p>
              <div className="rounded-2xl border border-slate-800/60 bg-white/5 p-4 shadow-sm">
                <p className="truncate text-sm font-medium text-slate-100">
                  {user?.email}
                </p>
                <button
                  className="mt-3 w-full rounded-xl border border-slate-800/60 bg-transparent px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-sky-400/60 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                  onClick={() => signOut()}
                >
                  Log out
                </button>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
                  Channels
                </p>
              </div>
              <ul className="channel-list space-y-2 text-sm">
                {channels.map((channel) => (
                  <SidebarItem
                    channel={channel}
                    key={channel.id}
                    isActiveChannel={channel.id === Number(activeChannelId)}
                    user={user}
                  />
                ))}
              </ul>
            </section>
          </div>
        </nav>

        <div className="flex-1 overflow-hidden">{children}</div>
      </main>
    </>
  );
}

interface SidebarItemProps {
  channel: Channel;
  isActiveChannel: boolean;
  user: AppUser | null;
}

const SidebarItem = ({ channel, isActiveChannel, user }: SidebarItemProps) => (
  <li className="group flex items-center gap-2">
    <Link
      href={`/channels/${channel.id}`}
      className={`flex-1 truncate rounded-xl border px-3 py-2 transition ${
        isActiveChannel
          ? 'border-sky-400/60 bg-sky-400/10 text-slate-100'
          : 'border-transparent text-slate-400 hover:border-sky-400/30 hover:bg-white/5 hover:text-slate-100'
      }`}
    >
      {'#'}
      {channel.slug}
    </Link>
    {channel.id !== 1 &&
      (channel.created_by === user?.id || user?.appRole === 'admin') && (
        <button
          onClick={() => deleteChannel(channel.id)}
          className="rounded-full border border-transparent p-2 text-slate-500 transition hover:border-sky-400/40 hover:text-sky-400"
          aria-label={`Delete ${channel.slug}`}
        >
          <TrashIcon size={14} />
        </button>
      )}
  </li>
);
