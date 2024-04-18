import { useState, useRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputArea } from "@/components/ui/input-area";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
const formSchema = z.object({
  name: z.string().min(0).max(200),
  description: z.string().min(0).max(200),
  greeting: z.string().min(0).max(200),
  message_example: z.string().min(0).max(200)
});

function CreationPage() {
  const [tags, setTags] = useState<string[]>([]);
  const [characterName, setCharacterName] = useState("");
  const [characterDescription, setCharacterDescription] = useState("");
  const [greetingMessage, setGreetingMessage] = useState("");
  const [exampleMessages, setExampleMessages] = useState("");
  const fileInput = useRef(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      greeting: "",
      message_example: ""
    }
  });

  //TODO: Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  const handleClick = () => {
    fileInput.current.click();
  };

  //TODO: Implement file upload handler.
  const handleFileChange = (event) => {
    const file = event.target.files[0];
  };

  return (
    <div className="flex w-full items-center justify-center rounded-lg bg-background">
      <div className="rounded-lg bg-neutral-800">
        {/* Banner and profile picture */}
        <div className="relative rounded-lg">
          <div
            className="flex h-48 w-full cursor-pointer items-center justify-center rounded-t-lg bg-gradient-to-br from-neutral-700 to-neutral-500 object-cover"
            onClick={handleClick}
          >
            <input
              type="file"
              style={{ display: "none" }}
              ref={fileInput}
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png"
            />
            <PencilSquareIcon className="absolute h-14 w-14 text-neutral-300" />
          </div>
          <div
            className="absolute -bottom-12 left-4 flex h-24 w-24 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-neutral-700 to-neutral-600 object-cover"
            onClick={handleClick}
          >
            <PencilSquareIcon className="absolute h-8 w-8 text-neutral-300" />
            <input
              type="file"
              style={{ display: "none" }}
              ref={fileInput}
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png"
            />
          </div>
        </div>
        {/* Character details container */}
        <div className="px-6 pb-6 pt-12">
          <div className="flex flex-row">
            <div className="w-[30rem] pr-10">
              <div className="pb-2 text-2xl font-semibold"></div>
              <div className="whitespace-nowrap italic text-neutral-400"></div>
            </div>
            {/* Character tags */}
            <div className="flex">
              <div className="mr-4 text-2xl font-semibold">Tags:</div>
              <div>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="m-1 inline-block rounded-full bg-neutral-700 px-5 py-2 text-sm font-semibold text-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {/* Character details form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Character Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="add character name"
                        className="border-neutral-700 focus-visible:ring-neutral-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Character Description</FormLabel>
                    <FormControl>
                      <InputArea
                        placeholder="add character description"
                        className="scroll-secondary border-neutral-700 focus-visible:ring-neutral-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="greeting"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Character Greeting</FormLabel>
                    <FormControl>
                      <InputArea
                        placeholder="add character greeting"
                        className="scroll-secondary border-neutral-700 focus-visible:ring-neutral-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message_example"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message Examples</FormLabel>
                    <FormControl>
                      <InputArea
                        placeholder="add message examples"
                        className="scroll-secondary border-neutral-700 focus-visible:ring-neutral-400 "
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default CreationPage;
