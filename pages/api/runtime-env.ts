// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

interface RuntimeEnvResponse {
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
}

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<RuntimeEnvResponse>,
) {
  res.status(200).json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? null,
  });
}
