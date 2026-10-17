import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ExternalLink, Pencil, Plus, Trash2, Inbox } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { applicationsQuery } from "@/lib/queries";
import { STATUSES, STATUS_CLASS, friendlyError, type Status } from "@/lib/applications";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/applications/")({
  head: () => ({
    meta: [
      { title: "Applications — JobTrack" },
      { name: "description", content: "All your job applications, filterable by status." },
      { property: "og:title", content: "Applications — JobTrack" },
      { property: "og:description", content: "All your job applications, filterable by status." },
    ],
  }),
  component: Applications,
});

type App = NonNullable<Awaited<ReturnType<typeof applicationsQuery.queryFn>>>[number];

function Applications() {
  const { data, isLoading, isError } = useQuery(applicationsQuery);
  const [filter, setFilter] = useState<"All" | Status>("All");
  const qc = useQueryClient();

  const statusMut = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const { error } = await supabase.from("job_applications").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Status updated"); qc.invalidateQueries({ queryKey: ["applications"] }); },
    onError: (e) => toast.error(friendlyError(e as { code?: string })),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("job_applications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Application deleted"); qc.invalidateQueries({ queryKey: ["applications"] }); },
    onError: (e) => toast.error(friendlyError(e as { code?: string })),
  });

  const rows = (data ?? []).filter((a) => filter === "All" || a.status === filter);

  const statusSelect = (a: App) => (
    <Select value={a.status} onValueChange={(v) => statusMut.mutate({ id: a.id, status: v as Status })}>
      <SelectTrigger className={cn("h-8 w-[130px] border font-semibold", STATUS_CLASS[a.status as Status])}><SelectValue /></SelectTrigger>
      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
    </Select>
  );

  const actions = (a: App) => (
    <div className="flex gap-1">
      <Button variant="ghost" size="icon" asChild aria-label="Edit">
        <Link to="/applications/$id/edit" params={{ id: a.id }}><Pencil className="h-4 w-4" /></Link>
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this application?</AlertDialogTitle>
            <AlertDialogDescription>{a.job_title} at {a.company} will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMut.mutate(a.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  const link = (a: App) =>
    a.job_link ? (
      <a href={a.job_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
        Open <ExternalLink className="h-3.5 w-3.5" />
      </a>
    ) : <span className="text-muted-foreground">—</span>;

  const date = (d: string) => format(parseISO(d), "MMM d, yyyy");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Applications</h1>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>{(["All", ...STATUSES] as const).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Button asChild><Link to="/applications/new"><Plus className="h-4 w-4" /> Add</Link></Button>
        </div>
      </div>

      {isError && <p className="text-destructive">Something went wrong. Please try again.</p>}
      {isLoading && <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>}

      {data && rows.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">{data.length === 0 ? "No applications yet" : `No ${filter} applications`}</p>
            <Button asChild><Link to="/applications/new">Add application</Link></Button>
          </CardContent>
        </Card>
      )}

      {rows.length > 0 && (
        <>
          <Card className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead><TableHead>Job title</TableHead><TableHead>Applied date</TableHead>
                  <TableHead>Status</TableHead><TableHead>Link</TableHead><TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.company}</TableCell>
                    <TableCell>{a.job_title}</TableCell>
                    <TableCell>{date(a.applied_date)}</TableCell>
                    <TableCell>{statusSelect(a)}</TableCell>
                    <TableCell>{link(a)}</TableCell>
                    <TableCell>{actions(a)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <div className="space-y-3 md:hidden">
            {rows.map((a) => (
              <Card key={a.id}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{a.job_title}</p>
                      <p className="text-sm text-muted-foreground">{a.company} · {date(a.applied_date)}</p>
                    </div>
                    {actions(a)}
                  </div>
                  <div className="flex items-center justify-between">{statusSelect(a)}{link(a)}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
