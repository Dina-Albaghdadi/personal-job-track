import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { EXTRACT_FAILURE_MESSAGE, jobPostInputSchema } from "./extraction";

export const extractJobPostDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => jobPostInputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return { ok: false as const, error: EXTRACT_FAILURE_MESSAGE };
    }
    try {
      const { extractJobDetails } = await import("./extraction.server");
      const details = await extractJobDetails(data.job_post, apiKey);
      return { ok: true as const, details };
    } catch {
      return { ok: false as const, error: EXTRACT_FAILURE_MESSAGE };
    }
  });
