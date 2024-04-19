import { useEffect, useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import {
  EllipsisHorizontalIcon,
  PencilSquareIcon,
  UserPlusIcon,
  WrenchScrewdriverIcon
} from "@heroicons/react/24/solid";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { queries } from "@/lib/queries";
import { toast } from "sonner";
import { PersonaBundle } from "@shared/types";
import { useApp } from "@/components/AppContext";
import { Checkbox } from "@/components/ui/checkbox";
import { config } from "@shared/config";

export default function SettingsPersona() {
  const [personaBundles, setPersonaBundles] = useState<PersonaBundle[]>([]);
  const { createModal, closeModal } = useApp();

  useEffect(() => {
    syncAllPersonaBundles();
  }, []);

  const syncAllPersonaBundles = async () => {
    const res = await queries.getAllExtantPersonaBundles();
    if (res.kind == "err") {
      toast.error("Error fetching persona bundle.");
      console.error(res.error);
      return;
    }
    setPersonaBundles(res.value);
  };

  const handleNew = () => {
    createModal(
      <PersonaModal
        title="New Persona"
        submit={{
          label: "Create",
          handle: async (name, description, isDefault) => {
            closeModal();
            try {
              await queries.insertPersona(name, description, isDefault);
            } catch (e) {
              toast.error(`Error creating persona. Error: ${e}`);
              console.error(e);
            } finally {
              syncAllPersonaBundles();
            }
          }
        }}
      />
    );
  };

  const handleEdit = (id: number, name: string, description: string, isDefault: boolean) => {
    createModal(
      <PersonaModal
        title="Edit Persona"
        initialName={name}
        initialDescription={description}
        initialIsDefault={isDefault}
        submit={{
          label: "Save",
          handle: async (name, description, isDefault) => {
            closeModal();
            try {
              await queries.updatePersona(id, name, description, isDefault);
            } catch (e) {
              toast.error(`Error updating persona. Error: ${e}`);
              console.error(e);
            } finally {
              syncAllPersonaBundles();
            }
          }
        }}
        remove={{
          label: "Remove",
          handle: () => {
            closeModal();
            handleDelete(id);
          }
        }}
      />
    );
  };

  const handleDelete = async (id: number) => {
    try {
      await queries.deletePersona(id);
      toast.success("Persona deleted successfully.");
    } catch (err) {
      toast.error(`Error deleting persona. Error: ${err}`);
    } finally {
      syncAllPersonaBundles();
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-3 bg-background">
      {/* Personas List */}
      <div className=" flex max-h-[50%] min-h-20 w-[28rem] rounded-2xl border border-neutral-700 bg-neutral-800 py-2">
        <div className="scroll-secondary flex h-full w-full flex-col space-y-2 overflow-y-scroll px-3">
          {personaBundles.map((bundle, idx) => {
            return (
              <ContextMenu key={idx}>
                <ContextMenuTrigger>
                  <button
                    className={`group flex h-fit w-full items-center justify-between rounded-lg p-3 font-[480]
                   text-neutral-100 transition duration-200 ease-out hover:bg-neutral-700 focus:outline-none`}
                    onClick={() =>
                      handleEdit(
                        bundle.data.id,
                        bundle.data.name,
                        bundle.data.description,
                        bundle.data.is_default === 1 ? true : false
                      )
                    }
                  >
                    <div className="mr-3 flex w-full items-center space-x-5">
                      <img
                        draggable="false"
                        className="size-12 rounded-full object-cover object-top"
                        src={bundle.avatarURI || "default_avatar.png"}
                        alt="Avatar"
                      />
                      <div className="flex w-full flex-col">
                        <h3 className="line-clamp-1 w-5/6 text-ellipsis text-left text-[1.07rem] font-[550]">
                          {bundle.data.name}
                        </h3>
                        {bundle.data.description && bundle.data.description.length != 0 && (
                          <p className="line-clamp-1 text-ellipsis text-left text-[0.88rem] font-[470] text-gray-400">
                            {bundle.data.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <EllipsisHorizontalIcon className="size-5 shrink-0 cursor-pointer opacity-0 transition duration-75 ease-out group-hover:opacity-100" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-36">
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={(e) => {
                              // Prevent clicks on the dropdown menu items from triggering the parent button
                              e.preventDefault();
                            }}
                            onSelect={() =>
                              handleEdit(
                                bundle.data.id,
                                bundle.data.name,
                                bundle.data.description,
                                bundle.data.is_default === 1 ? true : false
                              )
                            }
                          >
                            Edit
                            <DropdownMenuShortcut>
                              <WrenchScrewdriverIcon className="size-4" />
                            </DropdownMenuShortcut>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              // Prevent clicks on the dropdown menu items from triggering the parent button
                              e.preventDefault();
                            }}
                            onSelect={() => handleDelete(bundle.data.id)}
                          >
                            Delete
                            <DropdownMenuShortcut>
                              <WrenchScrewdriverIcon className="size-4" />
                            </DropdownMenuShortcut>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </button>
                </ContextMenuTrigger>

                <ContextMenuContent className="w-36">
                  <ContextMenuItem
                    onSelect={() =>
                      handleEdit(
                        bundle.data.id,
                        bundle.data.name,
                        bundle.data.description,
                        bundle.data.is_default === 1 ? true : false
                      )
                    }
                  >
                    Edit
                    <ContextMenuShortcut>
                      <WrenchScrewdriverIcon className="size-4" />
                    </ContextMenuShortcut>
                  </ContextMenuItem>

                  <ContextMenuItem
                    onSelect={() => {
                      handleDelete(bundle.data.id);
                    }}
                  >
                    Delete
                    <ContextMenuShortcut>
                      <WrenchScrewdriverIcon className="size-4" />
                    </ContextMenuShortcut>
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </div>
      </div>
      <button className="flex items-center space-x-2 rounded-md bg-neutral-700 px-4 py-2" onClick={handleNew}>
        <UserPlusIcon className="size-5" />
        <span className="font-medium text-neutral-200">New</span>
      </button>
    </div>
  );
}
interface PersonaModalProps {
  title: string;
  initialName?: string;
  initialDescription?: string;
  initialIsDefault?: boolean;
  submit: {
    label: string;
    handle: (name: string, description: string, isDefault: boolean) => void;
  };
  remove?: {
    label: string;
    handle: () => void;
  };
}

function PersonaModal({
  title,
  initialName = "",
  initialDescription = "",
  initialIsDefault = false,
  submit,
  remove
}: PersonaModalProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [isDefault, setisDefault] = useState(false);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);
  useEffect(() => {
    setDescription(initialDescription);
  }, [initialDescription]);

  useEffect(() => {
    setisDefault(initialIsDefault);
  }, [initialIsDefault]);

  const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxChars = config.persona.nameMaxChars;
    if (e.target.value.length > maxChars) {
      toast.error(`Name cannot exceed ${maxChars} characters.`);
      return;
    }
    setName(e.target.value);
  };

  const handleDescriptionInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const maxChars = config.persona.descriptionMaxChars;
    if (e.target.value.length > maxChars) {
      toast.error(`Description cannot exceed ${maxChars} characters.`);
      return;
    }
    setDescription(e.target.value);
  };

  return (
    <div className="flex w-96 flex-col space-y-5 rounded-lg border border-neutral-700 bg-neutral-800 p-6 focus:outline-none">
      <h3 className="text-lg font-semibold">{title}</h3>
      {/* Name Input & Avatar */}
      <div className="flex w-full items-center space-x-6">
        {/* Name Input*/}
        <input
          type="text"
          className="relative h-12 w-64 select-text rounded-md border border-neutral-600 bg-neutral-700 px-2.5  placeholder:font-[450] focus:outline-none"
          value={name}
          onChange={handleNameInput}
          placeholder="Name"
        />
        {/* Avatar Display */}
        <button className="relative shrink-0  focus:outline-none">
          <div
            className={`flex size-14 shrink-0 select-none items-center justify-center 
            rounded-full bg-grad-magenta text-2xl font-bold`}
            onClick={() => {}}
          >
            {name.charAt(0)}
          </div>
          <PencilSquareIcon className="absolute -right-1 -top-1 size-6 rounded-sm fill-neutral-300 p-0.5" />
        </button>
      </div>
      {/* Description Input */}
      <textarea
        placeholder="Description"
        value={description}
        onChange={handleDescriptionInput}
        className="scroll-tertiary flex h-36 w-full resize-none items-start rounded-md border border-neutral-600 bg-neutral-700 p-2.5 placeholder:font-[450] focus:outline-none"
      />

      {/* Is Default? */}
      <div className="flex items-center space-x-2">
        <Checkbox
          className="rounded-[4px] border-[1px] border-neutral-400"
          checked={isDefault}
          onCheckedChange={(checked) => {
            const checkedState = checked === "indeterminate" ? false : checked;
            setisDefault(checkedState);
          }}
        />
        <span className="text-sm font-[460] text-neutral-200">Make Default</span>
      </div>

      {/* Footer Controls*/}
      <div className="flex w-full justify-end">
        <div className="flex flex-row space-x-3">
          {remove && (
            <button
              className="flex items-center rounded-sm bg-red-700 px-3 py-2 font-medium text-neutral-200 saturate-[.67]"
              onClick={remove.handle}
            >
              {remove.label}
            </button>
          )}
          <button
            className="flex items-center rounded-sm bg-neutral-700 px-3 py-2 font-medium text-neutral-200"
            onClick={() => {
              if (name.length == 0) {
                toast.error("Name cannot be empty.");
                return;
              }
              if (description.length == 0) {
                toast.error("Description cannot be empty.");
                return;
              }
              submit.handle(name, description, isDefault);
            }}
          >
            {submit.label}
          </button>
        </div>
      </div>
    </div>
  );
}
