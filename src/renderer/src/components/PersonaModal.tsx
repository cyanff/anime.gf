import { useEffect, useRef, useState } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { Checkbox } from "@/components/ui/checkbox";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { PersonaFormData, personaFormSchema } from "@shared/types";
import { toast } from "sonner";

interface PersonaModalProps {
  title: string;
  name?: string;
  description?: string;
  isDefault?: boolean;
  submit: {
    label: string;
    handle: (data: PersonaFormData) => void;
  };
  remove?: {
    label: string;
    handle: () => void;
  };
}

export function PersonaModal({
  title,
  name = "",
  description = "",
  isDefault = false,
  submit,
  remove
}: PersonaModalProps) {
  const [avatarNativeImage, setAvatarNativeImage] = useState<string | null>(null);

  const methods = useForm({
    resolver: zodResolver(personaFormSchema),
    defaultValues: {
      name: name,
      description: description,
      isDefault: isDefault,
      avatarURI: ""
    }
  });
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors }
  } = methods;

  useEffect(() => {
    Object.entries(errors).forEach(([key, value]) => {
      toast.error(`Error in field ${key}: ${value!.message}`);
    });
  }, [errors]);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    setValue("avatarURI", file.path);

    // Display the selected image in the preview
    const res = await window.api.blob.image.get(file.path);
    if (res.kind === "ok") {
      const dataURL = res.value.toDataURL();
      setAvatarNativeImage(dataURL);
    }
  };

  return (
    <div className="flex w-96 flex-col space-y-5 rounded-lg border border-line bg-background p-6 focus:outline-none">
      <h3 className="text-lg text-primary font-semibold">{title}</h3>
      {/* Name Input & Avatar */}
      <div className="flex w-full items-center space-x-6">
        {/* Name Input*/}
        <Input
          {...register("name")}
          className="relative h-12 w-64 select-text rounded-md border border-line bg-background-secondary px-2.5  placeholder:font-[450] focus:outline-none"
          placeholder="Name"
        />
        {/* Avatar Display */}
        <button className="relative shrink-0  focus:outline-none">
          {avatarNativeImage ? (
            // Display avatar image if available
            <img
              draggable="false"
              src={avatarNativeImage}
              alt="Avatar"
              className="h-12 w-12 select-none rounded-full"
              onClick={() => {
                avatarInputRef.current?.click();
              }}
            />
          ) : (
            // Else display default gradient avatar
            <div
              className={`flex size-14 shrink-0 select-none items-center justify-center 
            rounded-full bg-action-primary text-2xl text-primary font-bold`}
              onClick={() => {
                avatarInputRef.current?.click();
              }}
            >
              {"h"}
            </div>
          )}
          <PencilSquareIcon
            className="absolute -right-1 -top-1 size-6 rounded-sm fill-primary p-0.5"
            onClick={() => avatarInputRef.current?.click()}
          />
          <input
            type="file"
            onChange={handleAvatarChange}
            className="hidden"
            {...(register("avatarURI"),
            {
              ref: avatarInputRef
            })}
            accept=".png"
          />
        </button>
      </div>
      {/* Description Input */}
      <Textarea
        {...register("description")}
        placeholder="Description"
        className="scroll-tertiary flex h-36 w-full resize-none items-start rounded-md border border-line bg-background-secondary text-secondary p-2.5 placeholder:font-[450] focus:outline-none"
      />

      {/* Is Default? */}
      <div className="flex items-center space-x-2">
        <Controller
          control={control}
          name="isDefault"
          render={({ field }) => (
            <Checkbox
              className="rounded-[4px] border-[1px]"
              id="message-streaming"
              checked={field.value}
              onCheckedChange={(checked) => {
                const val = checked === true ? true : false;
                setValue("isDefault", val);
              }}
            />
          )}
        />
        <span className="text-sm font-[460] text-neutral-200">Make Default</span>
      </div>

      {/* Footer Controls*/}
      <div className="flex w-full justify-end">
        <div className="flex flex-row space-x-3">
          {remove && (
            <button
              className="flex items-center rounded-sm px-3 py-2 text-sm font-[450] text-red-400"
              onClick={remove.handle}
            >
              {remove.label}
            </button>
          )}
          <button
            className="flex items-center rounded-sm transition bg-action-primary hover:bg-action-secondary px-3 py-2 font-medium text-primary"
            onClick={handleSubmit(submit.handle)}
          >
            {submit.label}
          </button>
        </div>
      </div>
    </div>
  );
}
