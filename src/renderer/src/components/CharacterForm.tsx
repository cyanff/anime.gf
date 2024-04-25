import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PencilSquareIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { CardBundle, CardFormData, cardFormSchema } from "@shared/types";
import { useRef, useState, useEffect, useMemo } from "react";
import { DeepPartial, useForm } from "react-hook-form";

type FormType = "create" | "edit";

interface CharacterFormProps {
  cardBundle?: CardBundle;
  onSuccessfulSubmit(data: CardFormData): void;
  formType: FormType;
}

export default function CharacterForm({ cardBundle, onSuccessfulSubmit, formType }: CharacterFormProps) {
  const [bannerDisplayImage, setBannerDisplayImage] = useState<string | undefined>();
  const [avatarDisplayImage, setAvatarDisplayImage] = useState<string | undefined>();
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CardFormData>({ resolver: zodResolver(cardFormSchema) });

  const initialData: DeepPartial<CardFormData> = useMemo(
    () => ({
      character: cardBundle?.data.character,
      world: cardBundle?.data.world,
      meta: {
        title: cardBundle?.data.meta.title,
        notes: cardBundle?.data.meta.notes,
        tagline: cardBundle?.data.meta.tagline,
        tags: cardBundle?.data.meta.tags.join(",")
      }
    }),
    [cardBundle]
  );

  useEffect(() => {
    setBannerDisplayImage(cardBundle?.bannerURI);
    setAvatarDisplayImage(cardBundle?.avatarURI);
    form.reset(initialData);
  }, [cardBundle]);

  const onSubmit = (data: CardFormData) => {
    console.log(data);
    onSuccessfulSubmit(data);
  };

  const handleBannerClick = () => {
    if (bannerInputRef.current) {
      bannerInputRef.current.click();
    }
  };

  const handleProfileClick = () => {
    if (avatarInputRef.current) {
      avatarInputRef.current.click();
    }
  };

  const handleBannerChange = async (event) => {
    const file = event.target.files[0];
    form.setValue("character.bannerURI", file.path);

    const res = await window.api.blob.image.get(file.path);
    if (res.kind === "ok") {
      const dataUrl = res.value.toDataURL();
      setBannerDisplayImage(dataUrl);
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    form.setValue("character.avatarURI", file.path);

    const res = await window.api.blob.image.get(file.path);
    if (res.kind === "ok") {
      const dataUrl = res.value.toDataURL();
      setAvatarDisplayImage(dataUrl);
    }
  };

  return (
    <div className="scroll-secondary bg-float flex h-full w-full flex-col overflow-auto">
      {/* Banner and profile picture */}
      <div className="relative mb-12 shrink-0">
        <div
          className="bg-action-secondary flex h-48 w-full cursor-pointer items-center justify-center overflow-hidden opacity-75"
          onClick={handleBannerClick}
        >
          {bannerDisplayImage ? (
            <img src={bannerDisplayImage ?? ""} alt="Profile" className="" />
          ) : (
            <PencilSquareIcon className="absolute h-12 w-12 text-tx-primary" />
          )}
          <div className="absolute inset-0 bg-black opacity-0 transition-opacity duration-200 hover:opacity-10"></div>
          <input
            type="file"
            className="hidden"
            {...(form.register("character.bannerURI"),
            {
              ref: bannerInputRef
            })}
            onChange={handleBannerChange}
            accept=".png"
          />
        </div>
        <div
          className="bg-action-secondary absolute -bottom-12 left-4 flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden
            rounded-full"
          onClick={handleProfileClick}
        >
          {avatarDisplayImage ? (
            <img src={avatarDisplayImage} alt="Profile" className="" />
          ) : (
            <PencilSquareIcon className="absolute h-8 w-8 text-tx-primary" />
          )}
          <div className="absolute inset-0 bg-black opacity-0 transition-opacity duration-200 hover:opacity-10"></div>
          <input
            type="file"
            {...(form.register("character.avatarURI"),
            {
              ref: avatarInputRef
            })}
            onChange={handleAvatarChange}
            className="hidden"
            accept=".jpg,.jpeg,.png"
          />
        </div>
      </div>
      {/* Character details container */}
      <div className="px-6 pb-6 pt-12">
        <div className="flex flex-col pt-8">
          {/* Character details form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 ">
              <FormField
                control={form.control}
                name="character.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-tx-primary">Character Name</FormLabel>
                    <FormControl>
                      <Input placeholder="What should your character be named?" {...field} />
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
                    <FormLabel className="text-tx-primary">Character Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="add character description" {...field} />
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
                    <FormLabel className="text-tx-primary">Character Greeting</FormLabel>
                    <FormControl>
                      <Textarea placeholder="add character greeting" {...field} />
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
                    <FormLabel className="text-tx-primary">Message Examples</FormLabel>
                    <FormControl>
                      <Textarea placeholder="add message examples" {...field} />
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
                    <FormLabel className="text-tx-primary">World Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="add world description" {...field} />
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
                    <FormLabel className="text-tx-primary">Title</FormLabel>
                    <FormControl>
                      <Input placeholder="add title" {...field} />
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
                    <FormLabel className="text-tx-primary">Tagline</FormLabel>
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
                    <FormLabel className="text-tx-primary">Tags</FormLabel>
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
                    <FormLabel className="text-tx-primary">Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="optional creator notes to users of your card" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-3">
                {formType === "edit" && (
                  <button
                    className="flex items-center space-x-2 rounded-xl bg-transparent px-4 py-2 transition-colors duration-200 hover:bg-action-secondary"
                    type="button"
                    onClick={() => {
                      form.reset(initialData);
                      setBannerDisplayImage(initialData?.character?.bannerURI ?? "");
                      setAvatarDisplayImage(initialData?.character?.avatarURI ?? "");
                    }}
                  >
                    <span className="font-medium text-tx-primary">Reset</span>
                  </button>
                )}

                <button
                  className="flex items-center space-x-2 rounded-xl bg-action-primary px-4 py-2 transition ease-out duration-200 hover:brightness-90"
                  type="submit"
                >
                  <UserPlusIcon className="size-5 text-tx-primary" />
                  <span className="font-medium text-tx-primary">{formType === "create" ? "Create" : "Save"}</span>
                </button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
