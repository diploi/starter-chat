import Layout from '@/components/Layout';
import Message from '@/components/Message';
import MessageInput from '@/components/MessageInput';
import { useRouter } from 'next/router';
import { useStore, addMessage } from '@/lib/Store';
import { useContext, useEffect, useRef } from 'react';
import UserContext from '@/lib/UserContext';

export default function Channel() {
  const router = useRouter();
  const { user } = useContext(UserContext);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const redirectingRef = useRef(false);

  const { id: channelId } = router.query;
  const { messages, channels } = useStore({ channelId });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      block: 'end',
      behavior: 'smooth',
    });
  }, [messages]);

  useEffect(() => {
    if (!router.isReady) return;
    const numericChannelId = Number(channelId);
    const channelExists = channels.some(
      (channel) => channel.id === numericChannelId,
    );
    if (
      Number.isFinite(numericChannelId) &&
      !channelExists &&
      !redirectingRef.current
    ) {
      redirectingRef.current = true;
      router
        .replace('/channels/1')
        .catch((error) => console.error('Channel redirect failed', error));
    }
    if (channelExists) {
      redirectingRef.current = false;
    }
  }, [channels, channelId, router]);

  return (
    <Layout channels={channels} activeChannelId={channelId}>
      <div className="relative flex h-screen flex-col bg-slate-900/60">
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="flex h-full flex-col justify-end gap-4">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="border-t border-slate-800/60 bg-slate-950/70 px-6 py-5 backdrop-blur">
          <div className="rounded-2xl border border-slate-800/60 bg-white/5 px-4 py-3 shadow-2xl">
            <MessageInput
              onSubmit={async (text) => {
                if (user) {
                  await addMessage(text, Number(channelId), user.id);
                }
              }}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
