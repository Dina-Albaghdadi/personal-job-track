// Client-side function middleware: attaches the user's Supabase access token
// to server function calls so requireSupabaseAuth can validate them.
import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "./client";

export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(async ({ next }) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  return next(token ? { headers: { Authorization: `Bearer ${token}` } } : {});
});
