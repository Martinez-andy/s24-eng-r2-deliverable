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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import { useState, type BaseSyntheticEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Database } from "@/lib/schema";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Initialize species type
type Species = Database["public"]["Tables"]["species"]["Row"];


// Restrict species to the following strings
const kingdoms = z.enum(["Animalia", "Plantae", "Fungi", "Protista", "Archaea", "Bacteria"]);


// Define the species input contraints
const speciesSchema = z.object({
  scientific_name: z
    .string()
    .trim()
    .min(1)
    .transform((val) => val?.trim()),
  common_name: z
    .string()
    .nullable()
    // Transform empty string or only whitespace input to null before form submission, and trim whitespace otherwise
    .transform((val) => (!val || val.trim() === "" ? null : val.trim())),
  kingdom: kingdoms,
  total_population: z.number().int().positive().min(1).nullable(),
  image: z
    .string()
    .url()
    .nullable()
    // Transform empty string or only whitespace input to null before form submission, and trim whitespace otherwise
    .transform((val) => (!val || val.trim() === "" ? null : val.trim())),
  description: z
    .string()
    .nullable()
    // Transform empty string or only whitespace input to null before form submission, and trim whitespace otherwise
    .transform((val) => (!val || val.trim() === "" ? null : val.trim())),
});


// Define the delete statement's contraints (aka schema)
const delSchema = z.object({
  del_statement: z.string(),
});


// Create type for the edit species form as well as the delete entry form.
type FormData = z.infer<typeof speciesSchema>;
type DelData = z.infer<typeof delSchema>;

// The Learn More Dialog component + Edit Entry feature + delete entry
export default function LearnMoreDialog({ species, userId }: { species: Species; userId: string }) {
  const router = useRouter();

  // Keep track of whether the user is editing the input or not
  const [isEditing, setIsEditing] = useState(false);

  // Keep track of whether the user is deleting the entry or not
  const [isDeleting, setIsDeleting] = useState(false);

  // Define the inital values for the inputs (AKA current entry values)
  const defaultValues: Partial<FormData> = {
    scientific_name: species.scientific_name,
    common_name: species.common_name,
    kingdom: species.kingdom,
    total_population: species.total_population,
    image: species.image,
    description: species.description,
  };

  // Define the delete entry form to an empty string (aka no input)
  const delDefault: Partial<DelData> = {
    del_statement: "",
  };


  // Define the form object
  const form = useForm<FormData>({
    resolver: zodResolver(speciesSchema),
    defaultValues,
    mode: "onChange",
  });


  // Define the delete form object
  const delForm = useForm<DelData>({
    resolver: zodResolver(delSchema),
    delDefault,
    mode: "onChange",
  });


  // Handles the deleting an entry. Function also checks to make sure the input is correct, if not then it raises an error
  const onDelete = async (delInput: DelData) => {

    // Check input to make sure it matches the delete statement
    if (delInput.del_statement === `DELETE ${species.scientific_name}`) {

      // prepare a supabase object so we can delete the species' entry
      const supabase = createBrowserSupabaseClient();


      // Delete species' entry
      const { error } = await supabase.from("species").delete().eq("id", species.id);

      // Handle errors
      if (error) {
        return toast({
          title: "Something went wrong.",
          description: error.message,
          variant: "destructive",
        });
      }

      // Clear the form
      delForm.reset(delDefault);

      // reset the usestate to revert the dialog back to normal state
      setIsDeleting(false);
      setIsEditing(false);

      // Update the page to reflect the entry's deletion
      router.refresh();

      // Tell the user the deletion happened properly
      return toast({
        title: `${species.scientific_name} was successfully deleted`,
      });
    }

    // Since input doesn't match the delete statement, raise an error and clear form
    delForm.reset(delDefault);
    return toast({
      title: "Something went wrong.",
      description: "Improper deletion input",
      variant: "destructive",
    });
  };


  // Handles the updating of species information once form is submitted
  const onSubmit = async (input: FormData) => {
    // Instantiate a supabase object
    const supabase = createBrowserSupabaseClient();


    // Update supabase database with form's input, use species.id to identify entry
    const { error } = await supabase
      .from("species")
      .update({
        scientific_name: input.scientific_name,
        common_name: input.common_name,
        kingdom: input.kingdom,
        total_population: input.total_population,
        image: input.image,
        description: input.description,
      })
      .eq("id", species.id);

    // Handle any errors
    if (error) {
      return toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
    }

    // Since no errors happened do the following...
    setIsEditing(false);

    // Set the form values to those that were just submitted.
    form.reset(input);

    // Needed to make sure the card updates with the newly inputted information!
    router.refresh();

    // Provide the user with a message letting them know that their updates went through successfully!
    return toast({
      title: `${species.common_name} data was updated successfully!`,
    });
  };

  // Activated when the "start editing" button is clicked. Allows the user to edit the input fields
  const startEditing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEditing(true);
  };

  // Activated when the "cancel" button is clicked. Reverts all edits and reverts input fields back to being immutable.
  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();

    // Reset the form to its inputs
    form.reset(defaultValues);
    delForm.reset(delDefault);
    // Make the form immutable again.
    setIsEditing(false);
    setIsDeleting(false);
  };

  // Handles the rendering of delete confirmation dialog.
  const renderDelete = (e: React.MouseEvent) => {
    e.preventDefault();

    setIsDeleting(true);
  };

  /*
    Renders the learn more dialog. Also coantains edit entry, and delete entry logic,
    Put into one componenet to avoid using embedded dialog pop-ups
  */
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mt-3 w-full">Learn More</Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
        {isDeleting ? (
          <>
            <DialogHeader>
              <DialogTitle>DELETE ENTRY:</DialogTitle>
              <DialogDescription>DELETING IS NOT REVERSIBLE!</DialogDescription>
              <Form {...delForm}>
                <form onSubmit={(e: BaseSyntheticEvent) => void delForm.handleSubmit(onDelete)(e)}>
                  <div className="grid w-full items-center gap-4">
                    <FormField
                      control={delForm.control}
                      name="del_statement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type: DELETE {species.scientific_name}</FormLabel>
                          <FormControl>
                            <Input placeholder={"DELETE " + species.scientific_name} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button className="ml-1 mr-1 flex-auto" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button className="ml-1 mr-1 flex-auto" variant="destructive" type="submit">
                      DELETE ENTRY
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogHeader>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{isEditing ? <>Edit Entry</> : <>More Information</>}</DialogTitle>
              <DialogDescription>
                {isEditing ? (
                  <>Edit the input fields below and click the &quot;Edit Entry&quot; button to submit changes.</>
                ) : (
                  <>Here&apos;s more information on {species.common_name}!</>
                )}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={(e: BaseSyntheticEvent) => void form.handleSubmit(onSubmit)(e)}>
                <div className="grid w-full items-center gap-4">
                  <FormField
                    control={form.control}
                    name="scientific_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scientific Name</FormLabel>
                        <FormControl>
                          <Input readOnly={!isEditing} placeholder={species.scientific_name} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="common_name"
                    render={({ field }) => {
                      // We must extract value from field and convert a potential defaultValue of `null` to "" because inputs can't handle null values: https://github.com/orgs/react-hook-form/discussions/4091
                      const { value, ...rest } = field;
                      return (
                        <FormItem>
                          <FormLabel>Common Name</FormLabel>
                          <FormControl>
                            <Input
                              readOnly={!isEditing}
                              value={value ?? ""}
                              placeholder={species.common_name}
                              {...rest}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="kingdom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kingdom</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(kingdoms.parse(value))}
                          value={field.value}
                          disabled={!isEditing}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a kingdom" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              {kingdoms.options.map((kingdom, index) => (
                                <SelectItem key={index} value={kingdom}>
                                  {kingdom}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="total_population"
                    render={({ field }) => {
                      const { value, ...rest } = field;
                      return (
                        <FormItem>
                          <FormLabel>Total population</FormLabel>
                          <FormControl>
                            {/* Using shadcn/ui form with number: https://github.com/shadcn-ui/ui/issues/421 */}
                            <Input
                              type="number"
                              value={value ?? ""}
                              placeholder="300000"
                              {...rest}
                              onChange={(event) => field.onChange(+event.target.value)}
                              readOnly={!isEditing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => {
                      // We must extract value from field and convert a potential defaultValue of `null` to "" because inputs can't handle null values: https://github.com/orgs/react-hook-form/discussions/4091
                      const { value, ...rest } = field;
                      return (
                        <FormItem>
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input
                              value={value ?? ""}
                              placeholder="https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/George_the_amazing_guinea_pig.jpg/440px-George_the_amazing_guinea_pig.jpg"
                              {...rest}
                              readOnly={!isEditing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => {
                      // We must extract value from field and convert a potential defaultValue of `null` to "" because textareas can't handle null values: https://github.com/orgs/react-hook-form/discussions/4091
                      const { value, ...rest } = field;
                      return (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              value={value ?? ""}
                              placeholder={species.description}
                              {...rest}
                              readOnly={!isEditing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  {/*
                      First asks if the user should have the ability to edit. AKA if current user is original author
                      Then it asks, "is the user in edit mode?" AKA has the user clicked the start editing button.
                        If so, then make the Edit Entry and Cancel buttons pop-up and make the inputs mutable.
                        If not, then render the Start Editing button
                    */}
                  {userId === species.author &&
                    (isEditing ? (
                      <div className="flex">
                        <Button className="ml-1 mr-1 flex-auto" type="submit">
                          Edit Entry
                        </Button>
                        <Button variant="secondary" className="ml-1 mr-1 flex-auto" onClick={handleCancel}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex">
                        <Button className="ml-1 mr-1 flex-auto" onClick={startEditing}>
                          Start Editing
                        </Button>
                        <Button className="ml-1 mr-1 flex-auto" variant="destructive" onClick={renderDelete}>
                          Delete Entry
                        </Button>
                      </div>
                    ))}
                </div>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
