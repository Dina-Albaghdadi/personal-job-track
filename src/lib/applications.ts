import { z } from "zod";
import { format } from "date-fns";

export const STATUSES = ["Applied", "Interview", "Offer", "Rejected"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_CLASS: Record<Status, string> = {
  Applied: "bg-status-applied-bg text-status-applied border-status-applied/30",
  Interview: "bg-status-interview-bg text-status-interview border-status-interview/30",
  Offer: "bg-status-offer-bg text-status-offer border-status-offer/30",
  Rejected: "bg-status-rejected-bg text-status-rejected border-status-rejected/30",
};

export const todayStr = () => format(new Date(), "yyyy-MM-dd");

export const applicationSchema = z.object({
  company: z.string().trim().min(1, "Company is required.").max(100, "Max 100 characters."),
  job_title: z.string().trim().min(1, "Job title is required.").max(100, "Max 100 characters."),
  job_link: z
    .string()
    .trim()
    .refine((v) => v === "" || /^https?:\/\//i.test(v), "Job link must start with http:// or https://"),
  applied_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Applied date is required.")
    .refine((v) => v <= todayStr(), "Applied date cannot be in the future."),
  status: z.enum(STATUSES),
  notes: z.string().trim().max(500, "Notes: max 500 characters."),
});

export type ApplicationInput = z.input<typeof applicationSchema>;

export function friendlyError(err: { code?: string } | null | undefined): string {
  if (err?.code === "23505") return "You already added this job at this company.";
  if (err?.code === "23514") return "Some data is not valid. Please check the form.";
  return "Something went wrong. Please try again.";
}
