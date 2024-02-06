"use client";

import { Separator } from "@/components/ui/separator";
import { TypographyH2 } from "@/components/ui/typography";
import AddSpeciesDialog from "./add-species-dialog";
import { Button } from "@/components/ui/button";
import type { Database } from "@/lib/schema";
import SpeciesCard from "./species-card";
import { useState } from "react";

type Species = Database["public"]["Tables"]["species"]["Row"];

export default function InteractivePage ({ species, alphaSpecies, sessionId} :
  { species : Species[], alphaSpecies : Species[], sessionId: string}) {

    const [alphabetical, setAlphabetical] = useState<boolean>(false);

  return (
      <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <TypographyH2>Species List</TypographyH2>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="secondary" onClick={() => setAlphabetical(!alphabetical)}>Order Alphabetically</Button>
          <AddSpeciesDialog userId={sessionId} />
        </div>
      </div>
      <Separator className="my-4" />
      {alphabetical ? (
        <>
          <div className="flex flex-wrap justify-center">
            {alphaSpecies?.map((alphaSpecies) => <SpeciesCard key={alphaSpecies.id} species={alphaSpecies} userId={sessionId}/>)}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap justify-center">
            {species?.map((species) => <SpeciesCard key={species.id} species={species} userId={sessionId}/>)}
          </div>
        </>
      )}
    </>
  )
}
