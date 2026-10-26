import { describe, it, expect } from "vitest";
import {
  EXTRACT_FAILURE_MESSAGE,
  JOB_POST_MAX_LENGTH,
  extractedDetailsSchema,
  jobPostInputSchema,
} from "./extraction";

const valid = { company: "Acme", job_title: "Dev", job_link: "https://x.com/job", required_skills: ["React"] };

describe("job post input rules", () => {
  it("rejects a job post over 8000 characters", () => {
    expect(jobPostInputSchema.safeParse({ job_post: "a".repeat(JOB_POST_MAX_LENGTH + 1) }).success).toBe(false);
    expect(jobPostInputSchema.safeParse({ job_post: "a".repeat(JOB_POST_MAX_LENGTH) }).success).toBe(true);
  });
  it("rejects a blank job post", () => {
    expect(jobPostInputSchema.safeParse({ job_post: "   " }).success).toBe(false);
  });
});

describe("strict AI response validation", () => {
  it("accepts a fully populated response", () => {
    expect(extractedDetailsSchema.safeParse(valid).success).toBe(true);
  });
  it("accepts null fields and empty skills", () => {
    expect(
      extractedDetailsSchema.safeParse({ company: null, job_title: null, job_link: null, required_skills: [] }).success,
    ).toBe(true);
  });
  it("rejects a response missing a field", () => {
    const { company: _omit, ...rest } = valid;
    expect(extractedDetailsSchema.safeParse(rest).success).toBe(false);
  });
  it("rejects extra keys", () => {
    expect(extractedDetailsSchema.safeParse({ ...valid, salary: "100k" }).success).toBe(false);
  });
  it("rejects wrong types", () => {
    expect(extractedDetailsSchema.safeParse({ ...valid, required_skills: "React" }).success).toBe(false);
    expect(extractedDetailsSchema.safeParse({ ...valid, company: 42 }).success).toBe(false);
  });
});

describe("failure message", () => {
  it("uses the exact wording", () => {
    expect(EXTRACT_FAILURE_MESSAGE).toBe("Couldn't extract details. Please fill the form manually.");
  });
});
