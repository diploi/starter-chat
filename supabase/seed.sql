insert into public.role_permissions (role, permission)
values
    ('admin', 'channels.delete'),
    ('admin', 'messages.delete'),
    ('moderator', 'messages.delete');

-- Helper to seed users with
CREATE OR REPLACE FUNCTION public.create_user(
    email text,
    password text
) RETURNS uuid AS $$
  declare
  user_id uuid;
  encrypted_pw text;
BEGIN
  user_id := gen_random_uuid();
  encrypted_pw := crypt(password, gen_salt('bf'));
  
  INSERT INTO auth.users
    (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES
    ('00000000-0000-0000-0000-000000000000', user_id, 'authenticated', 'authenticated', email, encrypted_pw, '2023-05-03 19:41:43.585805+00', '2023-04-22 13:10:03.275387+00', '2023-04-22 13:10:31.458239+00', '{"provider":"email","providers":["email"]}', '{}', '2023-05-03 19:41:43.580424+00', '2023-05-03 19:41:43.585948+00', '', '', '', '');
  
  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES
    (gen_random_uuid(), user_id, user_id, format('{"sub":"%s","email":"%s"}', user_id::text, email)::jsonb, 'email', '2023-05-03 19:41:43.582456+00', '2023-05-03 19:41:43.582497+00', '2023-05-03 19:41:43.582497+00');

  return user_id;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    user_id uuid;
BEGIN
    user_id := public.create_user('test@example.com', 'password');

    insert into public.user_roles (user_id, role)
    values (user_id, 'admin');

    insert into public.channels (slug, created_by)
    values
        ('public', user_id),
        ('random', user_id);

    insert into public.messages (message, channel_id, user_id)
    values
        ('Hello World 👋', 1, user_id),
        ('Perfection is attained, not when there is nothing more to add, but when there is nothing left to take away.', 2, user_id);
END $$;

-- Drop the helper function
DROP FUNCTION IF EXISTS public.create_user;
