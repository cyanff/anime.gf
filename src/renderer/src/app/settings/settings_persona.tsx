import { useEffect, useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import { EllipsisHorizontalIcon, UserPlusIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/solid";

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

export default function SettingsPersona() {
  const [personaBundles, setPersonaBundles] = useState<PersonaBundle[]>([]);

  useEffect(() => {
    syncAllPersonaBundles();
  }, []);

  const syncAllPersonaBundles = async () => {
    const res = await queries.getAllPersonaBundles();
    if (res.kind == "err") {
      toast.error("Error fetching persona bundle.");
      return;
    }
    setPersonaBundles(res.value);
  };

  const handleEdit = (id: number) => {
    toast.info(`Edit persona with id: ${id}`);
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
      <div className=" flex max-h-[50%] min-h-20 w-[28rem] rounded-2xl border border-neutral-700 bg-neutral-800  py-2">
        <div className="scroll-secondary flex h-full w-full flex-col space-y-2 overflow-y-scroll px-3">
          {personaBundles.map((personaBundle, idx) => {
            return (
              <ContextMenu key={idx}>
                <ContextMenuTrigger>
                  <button
                    className={`group flex h-fit w-full items-center justify-between rounded-lg p-3 
                   font-[480] text-neutral-100 transition duration-200 ease-out hover:bg-neutral-700`}
                    onClick={() => handleEdit(personaBundle.data.id)}
                  >
                    <div className="mr-3 flex items-center space-x-5">
                      <img
                        draggable="false"
                        className="size-12 rounded-full object-cover object-top"
                        src={personaBundle.avatarURI || "default_avatar.png"}
                        alt="Avatar"
                      />
                      <div className="flex flex-col">
                        <h3 className="line-clamp-1 w-5/6 text-ellipsis text-left text-[1.07rem] font-[550]">
                          {personaBundle.data.name}
                        </h3>
                        {personaBundle.data.description && personaBundle.data.description.length != 0 && (
                          <p className="line-clamp-1 text-ellipsis text-left text-[0.88rem] font-[470] text-gray-400">
                            {personaBundle.data.description}
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
                          <DropdownMenuItem onSelect={() => handleEdit(personaBundle.data.id)}>
                            Edit
                            <DropdownMenuShortcut>
                              <WrenchScrewdriverIcon className="size-4" />
                            </DropdownMenuShortcut>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleDelete(personaBundle.data.id)}>
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
                  <ContextMenuItem onSelect={() => handleEdit(personaBundle.data.id)}>
                    Edit
                    <ContextMenuShortcut>
                      <WrenchScrewdriverIcon className="size-4" />
                    </ContextMenuShortcut>
                  </ContextMenuItem>

                  <ContextMenuItem
                    onSelect={() => {
                      handleDelete(personaBundle.data.id);
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
      <button className="flex items-center space-x-2 rounded-md bg-neutral-700 px-4 py-2">
        <UserPlusIcon className="size-5" />
        <span className="font-medium text-neutral-200">New</span>
      </button>
    </div>
  );
}
