import { useState, useRef, useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputArea } from "@/components/ui/input-area";
import { PencilSquareIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { CardBundle, CardData } from "@shared/types";
import { time } from "@/lib/time";

const formSchema = z.object({
  name: z.string().min(0).max(200),
  tags: z.string().min(0).max(200),
  description: z.string().min(0).max(200),
  greeting: z.string().min(0).max(200),
  message_example: z.string().min(0).max(200)
});

interface EditPageProps {
  setPage: (page: string) => void;
  cardBundle: CardBundle;
  syncCardBundles: () => void;
}

export default function EditPage({ setPage, cardBundle, syncCardBundles }: EditPageProps) {
  const [bannerNativeImage, setBannerNativeImage] = useState<string | null>(null);
  const [avatarNativeImage, setAvatarNativeImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const bannerInput = useRef<HTMLInputElement>(null);
  const avatarInput = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: cardBundle.data.character.name,
      tags: cardBundle.data.meta.tags.join(", "),
      description: cardBundle.data.character.description,
      greeting: cardBundle.data.character.greeting,
      message_example: cardBundle.data.character.msg_examples
    }
  });

  useEffect(() => {
    const fetchImage = async () => {
      setBannerNativeImage(cardBundle.bannerURI);
      setAvatarNativeImage(cardBundle.avatarURI);
    };

    fetchImage();
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Create CardData object
    const cardData: CardData = {
      spec: "spec",
      spec_version: "spec_version",
      character: {
        name: values.name,
        description: values.description,
        greeting: values.greeting,
        msg_examples: values.message_example
      },
      world: {
        description: "description"
      },
      meta: {
        title: values.name,
        created_at: new Date().toLocaleDateString(),
        creator: {
          card: "card",
          character: "character",
          world: "world"
        },
        tagline: "tagline",
        tags: values.tags.split(",")
      }
    };

    // Send the card data to the backend
    const res = await window.api.blob.cards.post(cardData, bannerImage, avatarImage);
    if (res.kind === "ok") {
      console.log("Post function ran successfully. File path:", res.value);
      syncCardBundles();
    } else {
      console.error("An error occurred while running the post function:", res.error);
    }
  }

  const handleBannerClick = () => {
    if (bannerInput.current) {
      bannerInput.current.click();
    }
  };

  const handleProfileClick = () => {
    if (avatarInput.current) {
      avatarInput.current.click();
    }
  };

  const handleBannerChange = async (event) => {
    const file = event.target.files[0];
    setBannerImage(file.path);

    const res = await window.api.blob.image.get(file.path);
    if (res.kind === "ok") {
      const dataUrl = res.value.toDataURL();
      setBannerNativeImage(dataUrl);
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    setAvatarImage(file.path);

    const res = await window.api.blob.image.get(file.path);
    if (res.kind === "ok") {
      const dataUrl = res.value.toDataURL();
      setAvatarNativeImage(dataUrl);
    }
  };

  return (
    <div className="scroll-primary flex w-full items-center justify-center overflow-y-auto rounded-lg bg-background">
      <div className="w-[46rem] rounded-lg bg-neutral-800">
        {/* Banner and profile picture */}
        <div className="relative rounded-lg">
          <div
            className="flex h-48 w-full cursor-pointer items-center justify-center overflow-hidden rounded-t-lg bg-gradient-to-br from-neutral-700 to-neutral-500"
            onClick={handleBannerClick}
          >
            {bannerNativeImage ? (
              <img src={bannerNativeImage ?? ""} alt="Profile" className="" />
            ) : (
              <PencilSquareIcon className="absolute h-12 w-12 text-neutral-300" />
            )}
            <div className="absolute  inset-0 bg-black opacity-0 transition-opacity duration-200 hover:opacity-30"></div>
            <input
              type="file"
              style={{ display: "none" }}
              ref={bannerInput}
              onChange={handleBannerChange}
              accept=".jpg,.jpeg,.png"
            />
          </div>
          <div
            className="absolute -bottom-12 left-4 flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-neutral-700 to-neutral-600"
            onClick={handleProfileClick}
          >
            {avatarNativeImage ? (
              <img src={avatarNativeImage} alt="Profile" className="" />
            ) : (
              <PencilSquareIcon className="absolute h-8 w-8 text-neutral-300" />
            )}
            <div className="absolute inset-0 bg-black opacity-0 transition-opacity duration-200 hover:opacity-30"></div>
            <input
              type="file"
              style={{ display: "none" }}
              ref={avatarInput}
              onChange={handleAvatarChange}
              accept=".jpg,.jpeg,.png"
            />
          </div>
        </div>
        {/* Character details container */}
        <div className="px-6 pb-6 pt-12">
          <div className="flex flex-col pt-8">
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
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="add comma separated list of tags"
                          className="scroll-tertiary border-neutral-700 focus-visible:ring-neutral-400"
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
                          className="scroll-tertiary border-neutral-700 focus-visible:ring-neutral-400"
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
                          className="scroll-tertiary border-neutral-700 focus-visible:ring-neutral-400"
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
                          className="scroll-tertiary border-neutral-700 focus-visible:ring-neutral-400 "
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-4">
                  <button
                    className="flex items-center space-x-2 rounded-md bg-transparent px-4 py-2 transition-colors duration-200 hover:bg-neutral-600"
                    type="button"
                    onClick={() => {
                      form.reset({
                        name: cardBundle.data.character.name,
                        tags: cardBundle.data.meta.tags.join(", "),
                        description: cardBundle.data.character.description,
                        greeting: cardBundle.data.character.greeting,
                        message_example: cardBundle.data.character.msg_examples
                      });
                      setBannerNativeImage(cardBundle.bannerURI);
                      setAvatarNativeImage(cardBundle.avatarURI);
                    }}
                  >
                    <span className="font-medium text-neutral-200">Reset</span>
                  </button>
                  <button
                    className="flex items-center space-x-2 rounded-md bg-neutral-700 px-4 py-2 transition-colors duration-200 hover:bg-neutral-600"
                    type="submit"
                  >
                    <UserPlusIcon className="size-5" />
                    <span className="font-medium text-neutral-200">Save Changes</span>
                  </button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
