import { useContext } from 'react';
import UserContext from '@/lib/UserContext';
import {
  deleteMessage,
  type MessageRecord,
  type UserProfile,
} from '@/lib/Store';
import TrashIcon from '@/components/TrashIcon';

interface MessageProps {
  message: MessageRecord & { author?: UserProfile | null };
}

export default function Message({ message }: MessageProps) {
  const { user } = useContext(UserContext);

  const canDelete =
    (user?.id && user.id === message.user_id) ||
    (user?.appRole && ['admin', 'moderator'].includes(user.appRole));

  return (
    <div className="group relative flex items-start gap-4 rounded-2xl border border-slate-800/70 bg-white/5 px-5 py-4 text-sm text-slate-100 shadow-sm transition hover:border-sky-400/40">
      {canDelete && (
        <button
          onClick={() => deleteMessage(message.id)}
          className="absolute -right-2 -top-2 hidden rounded-full border border-slate-800/60 bg-slate-950/80 p-2 text-slate-500 transition hover:border-sky-400/50 hover:text-sky-400 group-hover:flex"
          aria-label="Delete message"
        >
          <TrashIcon size={14} />
        </button>
      )}
      <div className="mt-1 h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.6)]" />
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {message?.author?.username ?? 'Anonymous'}
        </p>
        <p className="leading-relaxed text-[15px] text-slate-100">
          {message.message}
        </p>
      </div>
    </div>
  );
}
