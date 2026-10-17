import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const applicationsQuery = queryOptions({
  queryKey: ["applications"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("job_applications")
      .select("*")
      .order("applied_date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const applicationQuery = (id: string) =>
  queryOptions({
    queryKey: ["applications", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("job_applications").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
