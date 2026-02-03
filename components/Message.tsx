import { useContext } from 'react';
import UserContext from '~/lib/UserContext';
import {
  deleteMessage,
  type MessageRecord,
  type UserProfile,
} from '~/lib/Store';
import TrashIcon from '~/components/TrashIcon';

interface MessageProps {
  message: MessageRecord & { author?: UserProfile | null };
}

const Message = ({ message }: MessageProps) => {
  const { user } = useContext(UserContext);

  const canDelete =
    (user?.id && user.id === message.user_id) ||
    (user?.appRole && ['admin', 'moderator'].includes(user.appRole));

  return (
    <div className="py-1 flex items-center space-x-2">
      <div className="text-gray-100 w-4">
        {canDelete && (
          <button onClick={() => deleteMessage(message.id)}>
            <TrashIcon />
          </button>
        )}
      </div>
      <div>
        <p className="text-blue-700 font-bold">{message?.author?.username}</p>
        <p className="text-white">{message.message}</p>
      </div>
    </div>
  );
};

export default Message;
