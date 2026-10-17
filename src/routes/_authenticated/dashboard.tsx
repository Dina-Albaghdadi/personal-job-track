import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Inbox } from "lucide-react";
import { applicationsQuery } from "@/lib/queries";
import { STATUSES, STATUS_CLASS } from "@/lib/applications";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — JobTrack" },
      { name: "description", content: "Overview of your job applications by status." },
      { property: "og:title", content: "Dashboard — JobTrack" },
      { property: "og:description", content: "Overview of your job applications by status." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading, isError } = useQuery(applicationsQuery);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button asChild><Link to="/applications/new"><Plus className="h-4 w-4" /> Add application</Link></Button>
      </div>
      {isError && <p className="text-destructive">Something went wrong. Please try again.</p>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {(["Total", ...STATUSES] as const).map((label) => {
          const count = label === "Total" ? data?.length : data?.filter((a) => a.status === label).length;
          return (
            <Card key={label} className={cn(label !== "Total" && STATUS_CLASS[label], "border")}>
              <CardContent className="p-4">
                <p className="text-sm font-medium opacity-80">{label}</p>
                {isLoading ? <Skeleton className="mt-2 h-8 w-12" /> : <p className="mt-1 text-3xl font-bold">{count ?? 0}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
      {data && data.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No applications yet</p>
            <p className="text-sm text-muted-foreground">Start tracking your job search by adding your first application.</p>
            <Button asChild><Link to="/applications/new">Add application</Link></Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
