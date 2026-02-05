import { useEffect, useState } from 'react';
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabaseClient';

export interface Channel {
  id: number;
  slug: string;
  created_by: string;
  [key: string]: unknown;
}

export interface UserProfile {
  id: string;
  username?: string;
  appRole?: string;
  [key: string]: unknown;
}

export interface MessageRecord {
  id: number;
  message: string;
  channel_id: number;
  user_id: string;
  inserted_at?: string;
  author?: UserProfile;
  [key: string]: unknown;
}

export interface UseStoreResult {
  messages: MessageRecord[];
  channels: Channel[];
  users: Map<string, UserProfile>;
}

/**
 * @param props channel specific configuration
 */
export const useStore = (props: {
  channelId?: number | string | string[];
  userId?: string | null;
}): UseStoreResult => {
  const [channels, setChannels] = useState<Channel[] | null>([]);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [users] = useState<Map<string, UserProfile>>(new Map());
  const [newMessage, handleNewMessage] = useState<MessageRecord | null>(null);
  const [newChannel, handleNewChannel] = useState<Channel | null>(null);
  const [newOrUpdatedUser, handleNewOrUpdatedUser] =
    useState<UserProfile | null>(null);
  const [deletedChannel, handleDeletedChannel] = useState<Channel | null>(null);
  const [deletedMessage, handleDeletedMessage] = useState<MessageRecord | null>(
    null,
  );

  // Load initial data and set up listeners
  useEffect(() => {
    let isMounted = true;
    let supabaseClient: SupabaseClient | null = null;
    let messageChannel: RealtimeChannel | null = null;
    let userChannel: RealtimeChannel | null = null;
    let channelChannel: RealtimeChannel | null = null;

    // Use unique channel names to avoid conflicts on re-subscription
    const subscriptionId = Math.random().toString(36).substring(2, 9);

    const applyChannels = (data: Channel[] | null) => {
      if (isMounted) {
        setChannels(data);
      }
    };

    // Get Channels
    (async () => {
      try {
        supabaseClient = await getSupabase();
        await fetchChannels(applyChannels);

        // Listen for new and deleted messages
        messageChannel = supabaseClient
          .channel(`public:messages:${subscriptionId}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'messages' },
            (payload) => handleNewMessage(payload.new as MessageRecord),
          )
          .on(
            'postgres_changes',
            { event: 'DELETE', schema: 'public', table: 'messages' },
            (payload) => handleDeletedMessage(payload.old as MessageRecord),
          )
          .subscribe();

        // Listen for changes to our users
        userChannel = supabaseClient
          .channel(`public:users:${subscriptionId}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'users' },
            (payload) => handleNewOrUpdatedUser(payload.new as UserProfile),
          )
          .subscribe();

        // Listen for new and deleted channels
        channelChannel = supabaseClient
          .channel(`public:channels:${subscriptionId}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'channels' },
            (payload) => handleNewChannel(payload.new as Channel),
          )
          .on(
            'postgres_changes',
            { event: 'DELETE', schema: 'public', table: 'channels' },
            (payload) => handleDeletedChannel(payload.old as Channel),
          )
          .subscribe();
      } catch (error) {
        console.error('Failed to initialise Supabase store', error);
      }
    })();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (supabaseClient) {
        if (messageChannel) supabaseClient.removeChannel(messageChannel);
        if (userChannel) supabaseClient.removeChannel(userChannel);
        if (channelChannel) supabaseClient.removeChannel(channelChannel);
      }
    };
  }, [props.userId]);

  // Update when the route changes
  useEffect(() => {
    const channelId = Number(props?.channelId ?? 0);
    if (channelId > 0) {
      let isActive = true;
      fetchMessages(channelId, (fetchedMessages) => {
        if (!isActive || !fetchedMessages) return;
        fetchedMessages.forEach((message) => {
          users.set(message.user_id, message.author as UserProfile);
        });
        setMessages(fetchedMessages);
      });
      return () => {
        isActive = false;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.channelId]);

  // New message received from Postgres
  useEffect(() => {
    if (newMessage && newMessage.channel_id === Number(props.channelId)) {
      const handleAsync = async () => {
        const authorId = newMessage.user_id;
        if (!users.get(authorId))
          await fetchUser(authorId, (user) =>
            handleNewOrUpdatedUser(user ?? null),
          );
        setMessages((prev) => prev.concat(newMessage));
      };
      handleAsync();
    }
  }, [newMessage, props.channelId, users]);

  // Deleted message received from postgres
  useEffect(() => {
    if (deletedMessage)
      setMessages((prev) =>
        prev.filter((message) => message.id !== deletedMessage.id),
      );
  }, [deletedMessage]);

  // New channel received from Postgres
  useEffect(() => {
    if (newChannel)
      setChannels((prev) => {
        const existing = prev ?? [];
        if (existing.some((channel) => channel.id === newChannel.id)) {
          return existing;
        }
        return existing.concat(newChannel);
      });
  }, [newChannel]);

  // Deleted channel received from postgres
  useEffect(() => {
    if (deletedChannel)
      setChannels((prev) => {
        if (!prev) return prev;
        return prev.filter((channel) => channel.id !== deletedChannel.id);
      });
  }, [deletedChannel]);

  // New or updated user received from Postgres
  useEffect(() => {
    if (newOrUpdatedUser) users.set(newOrUpdatedUser.id, newOrUpdatedUser);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newOrUpdatedUser]);

  return {
    messages: messages.map((message) => ({
      ...message,
      author: users.get(message.user_id),
    })),
    channels:
      channels !== null
        ? [...channels].sort((a, b) => a.slug.localeCompare(b.slug))
        : [],
    users,
  };
};

/**
 * Fetch all channels
 * @param setState Optionally pass in a hook or callback to set the state
 */
export const fetchChannels = async (
  setState?: (channels: Channel[] | null) => void,
): Promise<Channel[] | null | undefined> => {
  try {
    const supabase = await getSupabase();
    const { data } = await supabase.from('channels').select('*');
    const typed = data as Channel[] | null;
    if (setState) setState(typed);
    return typed;
  } catch (error) {
    console.log('error', error);
  }
};

/**
 * Fetch a single user
 * @param userId
 * @param setState Optionally pass in a hook or callback to set the state
 */
export const fetchUser = async (
  userId: string,
  setState?: (user: UserProfile | null) => void,
): Promise<UserProfile | null | undefined> => {
  try {
    const supabase = await getSupabase();
    const { data } = await supabase.from('users').select('*').eq('id', userId);
    const typed = data as UserProfile[] | null;
    const user = typed?.[0] ?? null;
    if (setState) setState(user);
    return user;
  } catch (error) {
    console.log('error', error);
  }
};

/**
 * Fetch all messages and their authors
 * @param channelId
 * @param setState Optionally pass in a hook or callback to set the state
 */
export const fetchMessages = async (
  channelId: number,
  setState?: (messages: MessageRecord[] | null) => void,
): Promise<MessageRecord[] | null | undefined> => {
  try {
    const supabase = await getSupabase();
    const { data } = await supabase
      .from('messages')
      .select('*, author:user_id(*)')
      .eq('channel_id', channelId)
      .order('inserted_at', { ascending: true });
    const typed = data as MessageRecord[] | null;
    if (setState) setState(typed);
    return typed;
  } catch (error) {
    console.log('error', error);
  }
};

/**
 * Insert a new channel into the DB
 * @param slug The channel name
 * @param user_id The channel creator
 */
export const addChannel = async (
  slug: string,
  user_id: string,
): Promise<Channel[] | null | undefined> => {
  try {
    const supabase = await getSupabase();
    const { data } = await supabase
      .from('channels')
      .insert([{ slug, created_by: user_id }])
      .select();
    return data as Channel[] | null;
  } catch (error) {
    console.log('error', error);
  }
};

/**
 * Insert a new message into the DB
 * @param message The message text
 * @param channel_id
 * @param user_id The author
 */
export const addMessage = async (
  message: string,
  channel_id: number,
  user_id: string,
): Promise<MessageRecord[] | null | undefined> => {
  try {
    const supabase = await getSupabase();
    const { data } = await supabase
      .from('messages')
      .insert([{ message, channel_id, user_id }])
      .select();
    return data as MessageRecord[] | null;
  } catch (error) {
    console.log('error', error);
  }
};

/**
 * Delete a channel from the DB
 * @param channel_id
 */
export const deleteChannel = async (
  channel_id: number,
): Promise<Channel[] | null | undefined> => {
  try {
    const supabase = await getSupabase();
    const { data } = await supabase
      .from('channels')
      .delete()
      .match({ id: channel_id });
    return data as Channel[] | null;
  } catch (error) {
    console.log('error', error);
  }
};

/**
 * Delete a message from the DB
 * @param message_id
 */
export const deleteMessage = async (
  message_id: number,
): Promise<MessageRecord[] | null | undefined> => {
  try {
    const supabase = await getSupabase();
    const { data } = await supabase
      .from('messages')
      .delete()
      .match({ id: message_id });
    return data as MessageRecord[] | null;
  } catch (error) {
    console.log('error', error);
  }
};
