import { createFileRoute } from "@tanstack/react-router";
import { ApplicationForm } from "@/components/ApplicationForm";

export const Route = createFileRoute("/_authenticated/applications/new")({
  head: () => ({
    meta: [
      { title: "Add application — JobTrack" },
      { name: "description", content: "Add a new job application to JobTrack." },
      { property: "og:title", content: "Add application — JobTrack" },
      { property: "og:description", content: "Add a new job application to JobTrack." },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Add application</h1>
      <ApplicationForm />
    </div>
  ),
});
