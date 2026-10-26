import { z } from "zod";

export const JOB_POST_MAX_LENGTH = 8000;
export const EXTRACT_FAILURE_MESSAGE = "Couldn't extract details. Please fill the form manually.";

export const jobPostInputSchema = z.object({
  job_post: z.string().trim().min(1, "Paste the job post first.").max(JOB_POST_MAX_LENGTH),
});

// Strict schema for the AI response: every field required, unknown keys rejected.
export const extractedDetailsSchema = z
  .object({
    company: z.string().max(100).nullable(),
    job_title: z.string().max(100).nullable(),
    job_link: z.string().max(2000).nullable(),
    required_skills: z.array(z.string().max(60)).max(30),
  })
  .strict();

export type ExtractedDetails = z.infer<typeof extractedDetailsSchema>;
