import Link from 'next/link';
import { useContext } from 'react';
import UserContext, { type AppUser } from '~/lib/UserContext';
import { addChannel, deleteChannel, type Channel } from '~/lib/Store';
import TrashIcon from '~/components/TrashIcon';
import type { ReactNode } from 'react';

interface LayoutProps {
  channels: Channel[];
  activeChannelId?: number | string | string[];
  children: ReactNode;
}

const Layout = ({ channels, activeChannelId, children }: LayoutProps) => {
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
    <main className="main flex h-screen w-screen overflow-hidden">
      <nav
        className="w-64 bg-gray-900 text-gray-100 overflow-scroll "
        style={{ maxWidth: '20%', minWidth: 150, maxHeight: '100vh' }}
      >
        <div className="p-2 ">
          <div className="p-2">
            <button
              className="bg-blue-900 hover:bg-blue-800 text-white py-2 px-4 rounded w-full transition duration-150"
              onClick={() => newChannel()}
            >
              New Channel
            </button>
          </div>
          <hr className="m-2" />
          <div className="p-2 flex flex-col space-y-2">
            <h6 className="text-xs">{user?.email}</h6>
            <button
              className="bg-blue-900 hover:bg-blue-800 text-white py-2 px-4 rounded w-full transition duration-150"
              onClick={() => signOut()}
            >
              Log out
            </button>
          </div>
          <hr className="m-2" />
          <h4 className="font-bold">Channels</h4>
          <ul className="channel-list">
            {channels.map((channel) => (
              <SidebarItem
                channel={channel}
                key={channel.id}
                isActiveChannel={channel.id === Number(activeChannelId)}
                user={user}
              />
            ))}
          </ul>
        </div>
      </nav>

      <div className="flex-1 bg-gray-800 h-screen">{children}</div>
    </main>
  );
};

interface SidebarItemProps {
  channel: Channel;
  isActiveChannel: boolean;
  user: AppUser | null;
}

const SidebarItem = ({ channel, isActiveChannel, user }: SidebarItemProps) => (
  <li className="flex items-center justify-between">
    <Link href="/channels/[id]" as={`/channels/${channel.id}`}>
      <a className={isActiveChannel ? 'font-bold' : ''}>{channel.slug}</a>
    </Link>
    {channel.id !== 1 &&
      (channel.created_by === user?.id || user?.appRole === 'admin') && (
        <button onClick={() => deleteChannel(channel.id)}>
          <TrashIcon />
        </button>
      )}
  </li>
);

export default Layout;
