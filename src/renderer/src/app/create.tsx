import { useRef, useState } from "react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputArea } from "@/components/ui/input-area";
import { PencilSquareIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { CardData, CardFormData, cardFormSchema } from "@shared/types";
import { useForm } from "react-hook-form";

interface CreationPageProps {
  setPage: (page: string) => void;
  syncCardBundles: () => void;
}

export default function CreationPage({ setPage, syncCardBundles }: CreationPageProps) {
  const [bannerNativeImage, setBannerNativeImage] = useState<string | null>(null);
  const [avatarNativeImage, setAvatarNativeImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const bannerInput = useRef<HTMLInputElement>(null);
  const avatarInput = useRef<HTMLInputElement>(null);

  const form = useForm<CardFormData>({ resolver: zodResolver(cardFormSchema) });
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors }
  } = form;

  async function onSubmit(data: CardFormData) {
    const cardData: CardData = {
      spec: "anime.gf",
      spec_version: "1.0",
      character: {
        name: data.character.name,
        description: data.character.description,
        greeting: data.character.greeting,
        msg_examples: data.character.msg_examples
      },
      world: {
        description: data.world.description
      },
      meta: {
        title: data.meta.title,
        notes: data.meta.notes,
        created_at: new Date().toISOString(),
        creator: {
          card: "you",
          character: "you",
          world: "you"
        },
        tagline: data.meta.tagline,
        tags: data.meta.tags.split(",")
      }
    };

    // Send the card data to the backend
    const res = await window.api.blob.cards.create(cardData, bannerImage, avatarImage);
    if (res.kind === "ok") {
      console.log("Post function ran successfully. File path:", res.value);
      setPage("collections");
    } else {
      console.error("An error occurred while running the post function:", res.error);
    }
    syncCardBundles();
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
    <div className="flex h-full w-full items-center justify-center bg-background">
      {/* Scroll Wrapper */}
      <div className="h-5/6 w-1/3 min-w-[30rem] overflow-hidden rounded-2xl bg-neutral-800">
        <div className="scroll-secondary flex h-full w-full flex-col overflow-auto">
          {/* Banner and profile picture */}
          <div className="relative mb-12 shrink-0">
            <div
              className="flex h-48 w-full cursor-pointer items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-700 to-neutral-500"
              onClick={handleBannerClick}
            >
              {bannerNativeImage ? (
                <img src={bannerNativeImage ?? ""} alt="Profile" className="" />
              ) : (
                <PencilSquareIcon className="absolute h-12 w-12 text-neutral-400" />
              )}
              <div className="absolute inset-0 bg-black opacity-0 transition-opacity duration-200 hover:opacity-10"></div>
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
              <div className="absolute inset-0 bg-black opacity-0 transition-opacity duration-200 hover:opacity-10"></div>
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
                    name="character.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Character Name</FormLabel>
                        <FormControl>
                          <Input placeholder="What should your character be named?" className="" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="character.description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Character Description</FormLabel>
                        <FormControl>
                          <InputArea placeholder="add character description" className="" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="character.greeting"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Character Greeting</FormLabel>
                        <FormControl>
                          <InputArea placeholder="add character greeting" className="" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="character.msg_examples"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message Examples</FormLabel>
                        <FormControl>
                          <InputArea placeholder="add message examples" className="" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="world.description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>World Description</FormLabel>
                        <FormControl>
                          <InputArea placeholder="add world description" className="" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="meta.title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="add title" className="" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="meta.tagline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tagline</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="a brief description of how you would describe the card to others."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="meta.tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input placeholder="add comma separated list of tags" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="meta.notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <InputArea
                            placeholder="optional creator notes to users of your card"
                            className=""
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <button
                      className="flex items-center space-x-2 rounded-md bg-grad-magenta px-4 py-2 transition-colors duration-200 hover:bg-neutral-600"
                      type="submit"
                    >
                      <UserPlusIcon className="size-5" />
                      <span className="font-medium text-neutral-200">Create</span>
                    </button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
