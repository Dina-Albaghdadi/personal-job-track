import { describe, it, expect } from "vitest";
import { applicationSchema, friendlyError } from "./applications";

const base = { company: "Acme", job_title: "Dev", job_link: "", applied_date: "2020-01-01", status: "Applied" as const, notes: "" };

describe("application rules", () => {
  it("rejects company over 100 chars", () => {
    expect(applicationSchema.safeParse({ ...base, company: "a".repeat(101) }).success).toBe(false);
  });
  it("rejects blank company after trim", () => {
    expect(applicationSchema.safeParse({ ...base, company: "   " }).success).toBe(false);
  });
  it("requires http(s) job link", () => {
    expect(applicationSchema.safeParse({ ...base, job_link: "www.x.com" }).success).toBe(false);
    expect(applicationSchema.safeParse({ ...base, job_link: "https://x.com" }).success).toBe(true);
  });
  it("rejects future applied date", () => {
    expect(applicationSchema.safeParse({ ...base, applied_date: "2999-01-01" }).success).toBe(false);
  });
  it("rejects notes over 500 chars", () => {
    expect(applicationSchema.safeParse({ ...base, notes: "a".repeat(501) }).success).toBe(false);
  });
  it("maps error codes", () => {
    expect(friendlyError({ code: "23505" })).toBe("You already added this job at this company.");
    expect(friendlyError({ code: "23514" })).toBe("Some data is not valid. Please check the form.");
    expect(friendlyError({ code: "XX" })).toBe("Something went wrong. Please try again.");
  });
});
