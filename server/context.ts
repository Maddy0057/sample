import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSession } from '@auth0/nextjs-auth0';

export interface Context {
  user: {
    id: string;
    email: string;
  } | null;
  supabase: SupabaseClient<any, 'public', any>;
}

export async function createContext(): Promise<Context> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  try {
    const session = await getSession();

    if (!session?.user) {
      return {
        user: null,
        supabase,
      };
    }

    return {
      user: {
        id: session.user.sub!,
        email: session.user.email || '',
      },
      supabase,
    };
  } catch (error) {
    return {
      user: null,
      supabase,
    };
  }
}
