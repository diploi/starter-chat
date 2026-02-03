import Layout from '~/components/Layout';
import Message from '~/components/Message';
import MessageInput from '~/components/MessageInput';
import { useRouter } from 'next/router';
import { useStore, addMessage } from '~/lib/Store';
import { useContext, useEffect, useRef } from 'react';
import UserContext from '~/lib/UserContext';

const ChannelsPage = () => {
  const router = useRouter();
  const { user } = useContext(UserContext);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const redirectingRef = useRef(false);

  const { id: channelId } = router.query;
  const { messages, channels } = useStore({ channelId });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      block: 'start',
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
      <div className="relative h-screen">
        <div className="Messages h-full pb-16">
          <div className="p-2 overflow-y-auto">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} style={{ height: 0 }} />
          </div>
        </div>
        <div className="p-2 absolute bottom-0 left-0 w-full">
          <MessageInput
            onSubmit={async (text) => {
              if (user) {
                await addMessage(text, Number(channelId), user.id);
              }
            }}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ChannelsPage;
