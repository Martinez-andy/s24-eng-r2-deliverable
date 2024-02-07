import { createServerSupabaseClient } from "@/lib/server-utils";
import InteractivePage from "./interactive-page";
import { redirect } from "next/navigation";


export default async function SpeciesList() {
  // Create supabase server component client and obtain user session from stored cookie
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // this is a protected route - only users who are signed in can view this route
    redirect("/");
  }

  // Obtain the ID of the currently signed-in user
  const sessionId = session.user.id;

  // Pull list of species order chronologcially and alphabetically
  const { data: species } = await supabase.from("species").select("*").order("id", { ascending: false });
  const { data: alphaSpecies } = await supabase.from("species").select("*").order("scientific_name", { ascending: true });

  /*
    Return interactive page componenet. Identical to original JSX but moved to a
    client rendered page. This allowed for easy toggling between alphabetical and
    chronological ordering by using state variables.
  */
  return (
    <InteractivePage species={species} alphaSpecies={alphaSpecies} sessionId={sessionId}></InteractivePage>
  );
}
