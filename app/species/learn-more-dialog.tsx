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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import type { Database } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import EditEntryDialog  from "./edit-entry-dialog";
// Stuff for functionality 2:
type Species = Database["public"]["Tables"]["species"]["Row"];



// Form stuff from Add-Species-Dialog.tsx

// Add a verify cancel button

export default function LearnMoreDialog({species, userId}: {species: Species, userId: string}) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="mt-3 w-full">Learn More</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>More Details:</DialogTitle>
                </DialogHeader>
                {/* Maybe we need to use useState from react? */}
                <p>Common name: {species.common_name}</p>
                <br />
                <p>Scientific name: {species.scientific_name}</p>
                <br />
                <p>Total Population: {species.total_population}</p>
                <br />
                <p>Kingdom: {species.kingdom}</p>
                <br />
                <p>Description: {species.description}</p>
                {(species.author === userId) &&
                <EditEntryDialog species={species} userId={userId}></EditEntryDialog>}
              </DialogContent>
      </Dialog>
  )
}
