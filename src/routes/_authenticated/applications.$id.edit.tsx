import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ApplicationForm } from "@/components/ApplicationForm";
import { applicationQuery } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";
import type { Status } from "@/lib/applications";

export const Route = createFileRoute("/_authenticated/applications/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit application — JobTrack" },
      { name: "description", content: "Edit a job application in JobTrack." },
      { property: "og:title", content: "Edit application — JobTrack" },
      { property: "og:description", content: "Edit a job application in JobTrack." },
    ],
  }),
  component: EditPage,
});

function EditPage() {
  const { id } = Route.useParams();
  const { data, isLoading, isError } = useQuery(applicationQuery(id));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Edit application</h1>
      {isLoading && <Skeleton className="h-96 w-full" />}
      {isError && <p className="text-destructive">Something went wrong. Please try again.</p>}
      {!isLoading && !isError && !data && (
        <p>Application not found. <Link to="/applications" className="text-primary underline">Back to applications</Link></p>
      )}
      {data && (
        <ApplicationForm
          id={id}
          initialSkills={data.required_skills}
          initial={{
            company: data.company,
            job_title: data.job_title,
            job_link: data.job_link ?? "",
            applied_date: data.applied_date,
            status: data.status as Status,
            notes: data.notes ?? "",
          }}
        />
      )}
    </div>
  );
}
