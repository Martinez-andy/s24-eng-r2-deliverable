"use client";
/*
Note: "use client" is a Next.js App Router directive that tells React to render the component as
a client component rather than a server component. This establishes the server-client boundary,
providing access to client-side functionality such as hooks and event handlers to this component and
any of its imported children. Although the SpeciesCard component itself does not use any client-side
functionality, it is beneficial to move it to the client because it is rendered in a list with a unique
key prop in species/page.tsx. When multiple component instances are rendered from a list, React uses the unique key prop
on the client-side to correctly match component state and props should the order of the list ever change.
React server components don't track state between rerenders, so leaving the uniquely identified components (e.g. SpeciesCard)
can cause errors with matching props and state in child components if the list order changes.
*/
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import type { Database } from "@/lib/schema";
import Image from "next/image";
// Stuff for functionality 2:
type Species = Database["public"]["Tables"]["species"]["Row"];

// Unsure if we are allowed or supposed to import useState but it is done in the add-species=dialog file
import { useState } from "react";

export default function SpeciesCard({ species }: { species: Species }, { userId } : { userId : string })  {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="m-4 w-72 min-w-72 flex-none rounded border-2 p-3 shadow">
      {species.image && (
        <div className="relative h-40 w-full">
          <Image src={species.image} alt={species.scientific_name} fill style={{ objectFit: "cover" }} />
        </div>
      )}
      <h3 className="mt-3 text-2xl font-semibold">{species.scientific_name}</h3>
      <h4 className="text-lg font-light italic">{species.common_name}</h4>
      <p>{species.description ? species.description.slice(0, 150).trim() + "..." : ""}</p>
      {/* Replace the button with the detailed view dialog. */}
      {/*
        Unsure why dialog is showing up like that, would like to fix the lack of a pop-up.
        Small bug. Whenever the user clicks learn more and then clicks another, the page rubber bands back
        to first learn more opening and closes it but does not open the new learn more. This is because the
        computer is listening for click events to close the dialog. Find a way to fix this with a more intuitive
        pop-up
      */}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="mt-3 w-full">Learn More</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <h1>More Details</h1>
          </DialogHeader>
          <h1>Common name: {species.common_name}</h1>
          <br />
          <h1>Scientific name: {species.scientific_name}</h1>
          <br />
          <h1>Total Population: {species.total_population}</h1>
          <br />
          <h1>Kingdom: {species.kingdom}</h1>
          <br />
          <h1>{userId}</h1>
          <h1>{species.author}</h1>
          <br />
          <h1>Description: {species.description}</h1>
          {(species.author === userId) &&
            <Button>
              Testing conditional rendering
            </Button>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
