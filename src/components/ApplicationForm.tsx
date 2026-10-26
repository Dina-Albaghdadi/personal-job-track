import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { applicationSchema, friendlyError, STATUSES, todayStr, type ApplicationInput, type Status } from "@/lib/applications";
import { extractJobPostDetails } from "@/lib/extraction.functions";
import { EXTRACT_FAILURE_MESSAGE, JOB_POST_MAX_LENGTH } from "@/lib/extraction";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type Errors = Partial<Record<keyof ApplicationInput, string>>;

export function ApplicationForm({ id, initial, initialSkills }: { id?: string; initial?: Partial<ApplicationInput>; initialSkills?: string[] }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const extractFn = useServerFn(extractJobPostDetails);
  const [skills, setSkills] = useState<string[]>(initialSkills ?? []);
  const [jobPost, setJobPost] = useState("");
  const [extractOpen, setExtractOpen] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [notFound, setNotFound] = useState<Set<"company" | "job_title" | "job_link">>(new Set());
  const [values, setValues] = useState<ApplicationInput>({
    company: "", job_title: "", job_link: "", applied_date: todayStr(), status: "Applied", notes: "",
    ...initial,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const set = <K extends keyof ApplicationInput>(k: K, v: ApplicationInput[K]) => setValues((s) => ({ ...s, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    const parsed = applicationSchema.safeParse(values);
    if (!parsed.success) {
      const errs: Errors = {};
      for (const i of parsed.error.issues) {
        const k = i.path[0] as keyof ApplicationInput;
        if (!errs[k]) errs[k] = i.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    const d = parsed.data;
    const payload = { ...d, job_link: d.job_link || null, notes: d.notes || null };
    setSaving(true);
    const { error } = id
      ? await supabase.from("job_applications").update(payload).eq("id", id)
      : await supabase.from("job_applications").insert(payload);
    setSaving(false);
    if (error) {
      setFormError(friendlyError(error));
      return;
    }
    await qc.invalidateQueries({ queryKey: ["applications"] });
    toast.success(id ? "Application updated" : "Application added");
    navigate({ to: "/applications" });
  }

  const err = (k: keyof ApplicationInput) => errors[k] && <p className="text-sm text-destructive">{errors[k]}</p>;

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={submit} className="space-y-5" noValidate>
          {formError && <Alert variant="destructive"><AlertDescription>{formError}</AlertDescription></Alert>}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input id="company" value={values.company} onChange={(e) => set("company", e.target.value)} />
              {err("company")}
            </div>
            <div className="space-y-2">
              <Label htmlFor="job_title">Job title *</Label>
              <Input id="job_title" value={values.job_title} onChange={(e) => set("job_title", e.target.value)} />
              {err("job_title")}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="job_link">Job link</Label>
            <Input id="job_link" placeholder="https://" value={values.job_link} onChange={(e) => set("job_link", e.target.value)} />
            {err("job_link")}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Applied date *</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className={cn("w-full justify-start font-normal", !values.applied_date && "text-muted-foreground")}>
                    <CalendarIcon className="h-4 w-4" />
                    {values.applied_date ? format(parseISO(values.applied_date), "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={values.applied_date ? parseISO(values.applied_date) : undefined}
                    onSelect={(d) => { set("applied_date", d ? format(d, "yyyy-MM-dd") : ""); setOpen(false); }}
                    disabled={{ after: new Date() }}
                    initialFocus
                    className="pointer-events-auto p-3"
                  />
                </PopoverContent>
              </Popover>
              {err("applied_date")}
            </div>
            <div className="space-y-2">
              <Label>Status *</Label>
              <Select value={values.status} onValueChange={(v) => set("status", v as Status)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="notes">Notes</Label>
              <span className={cn("text-xs", values.notes.length > 500 ? "text-destructive" : "text-muted-foreground")}>{values.notes.length}/500</span>
            </div>
            <Textarea id="notes" rows={4} value={values.notes} onChange={(e) => set("notes", e.target.value)} />
            {err("notes")}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate({ to: "/applications" })}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
