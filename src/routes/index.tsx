import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JobTrack — Track your job applications" },
      { name: "description", content: "Keep every job application, status and note in one place." },
      { property: "og:title", content: "JobTrack — Track your job applications" },
      { property: "og:description", content: "Keep every job application, status and note in one place." },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});
