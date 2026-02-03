import { createContext } from 'react';
import type { User } from '@supabase/supabase-js';

export interface AppUser extends User {
  appRole?: string;
}

export interface UserContextValue {
  userLoaded: boolean;
  authLoaded?: boolean;
  user: AppUser | null;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  userLoaded: false,
  user: null,
  signOut: async () => {},
});

export default UserContext;
