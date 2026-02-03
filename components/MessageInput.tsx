import { useState, type KeyboardEvent } from 'react';

interface MessageInputProps {
  onSubmit: (messageText: string) => void | Promise<void>;
}

const MessageInput = ({ onSubmit }: MessageInputProps) => {
  const [messageText, setMessageText] = useState('');

  const submitOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.keyCode === 13) {
      onSubmit(messageText);
      setMessageText('');
    }
  };

  return (
    <input
      className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
      type="text"
      placeholder="Share your update..."
      value={messageText}
      onChange={(e) => setMessageText(e.target.value)}
      onKeyDown={(e) => submitOnEnter(e)}
    />
  );
};

export default MessageInput;
