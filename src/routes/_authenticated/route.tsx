import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Briefcase, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: Layout,
});

const navCls = "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground";

function Layout() {
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function logout() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3">
          <Link to="/dashboard" className="mr-2 flex items-center gap-2 text-lg font-bold text-primary">
            <Briefcase className="h-5 w-5" /> JobTrack
          </Link>
          <nav className="flex gap-1">
            <Link to="/dashboard" className={navCls} activeProps={{ className: "bg-accent text-foreground" }}>Dashboard</Link>
            <Link to="/applications" activeOptions={{ exact: true }} className={navCls} activeProps={{ className: "bg-accent text-foreground" }}>Applications</Link>
            <Link to="/applications/new" className={navCls} activeProps={{ className: "bg-accent text-foreground" }}>Add</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden truncate text-sm text-muted-foreground sm:inline">{user.email}</span>
            <Button variant="outline" size="sm" onClick={logout}><LogOut className="h-4 w-4" /> Logout</Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6"><Outlet /></main>
    </div>
  );
}
