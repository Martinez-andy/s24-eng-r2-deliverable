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
          <Button variant="secondary" onClick={() => setAlphabetical(!alphabetical)}>{!alphabetical ? (
            <p>Order Alphabetically: A-Z</p>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-1">
              <p>Order Chronologically: </p>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.50009 0.877014C3.84241 0.877014 0.877258 3.84216 0.877258 7.49984C0.877258 11.1575 3.8424 14.1227 7.50009 14.1227C11.1578 14.1227 14.1229 11.1575 14.1229 7.49984C14.1229 3.84216 11.1577 0.877014 7.50009 0.877014ZM1.82726 7.49984C1.82726 4.36683 4.36708 1.82701 7.50009 1.82701C10.6331 1.82701 13.1729 4.36683 13.1729 7.49984C13.1729 10.6328 10.6331 13.1727 7.50009 13.1727C4.36708 13.1727 1.82726 10.6328 1.82726 7.49984ZM8 4.50001C8 4.22387 7.77614 4.00001 7.5 4.00001C7.22386 4.00001 7 4.22387 7 4.50001V7.50001C7 7.63262 7.05268 7.7598 7.14645 7.85357L9.14645 9.85357C9.34171 10.0488 9.65829 10.0488 9.85355 9.85357C10.0488 9.65831 10.0488 9.34172 9.85355 9.14646L8 7.29291V4.50001Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
            </div>
          )}</Button>
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
