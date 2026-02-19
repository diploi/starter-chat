<img alt="icon" src=".diploi/icon.svg" width="32">

# Chat App Starter Kit for Diploi

[![launch with diploi badge](https://diploi.com/launch.svg)](https://diploi.com/starter-kit/chat)
[![component on diploi badge](https://diploi.com/component.svg)](https://diploi.com/starter-kit/chat)
[![latest tag badge](https://badgen.net/github/tag/diploi/starter-chat)](https://diploi.com/starter-kit/chat)

A Slack like chat app built with **Next.js** and **Supabase**.

This starter kit demonstrates:

- 🔐 Authentication with Supabase
- ⚡️ Next.js -powered React frontend
- 🗄️ Supabase DB migrations and seeded data

---

## ✨ Overview

This starter kit consists of two Diploi components:

- **`next`** -- Frontend application (Next.js)
- **`supabase`** -- Database, auth, and realtime backend

Everything is wired together automatically via environment variables
defined in `diploi.yaml`.

---

## 🔑 Default Login Credentials

The database is seeded with a test account:

Email: `test@example.com`\
Password: `password`

You can log in immediately after deployment.

> ⚠️ Make sure to change or remove this account in production
> environments.

---

## 🚀 Running on Diploi

### Start a new project

1.  Create a new project in Diploi
2.  Select this starter kit
3.  Deploy

Diploi automatically:

- Connects Supabase to Next.js
- Injects environment variables
- Configures networking
- Builds production images
- Enables edge delivery via Cloudflare

---

## 💡 About Supabase

This project is originally based on the [nextjs-slack-clone](https://github.com/supabase/supabase/tree/master/examples/slack-clone/nextjs-slack-clone) and adapted for Diploi deployments.

Supabase is the Postgres development platform:\
https://supabase.com/
