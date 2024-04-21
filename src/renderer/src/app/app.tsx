import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

import ChatsPage from "@/app/chats";
import CollectionsPage from "@/app/collections";
import CreationPage from "@/app/create";
import EditPage from "@/app/edit";
import SettingsPage from "@/app/settings/settings";
import { AppContext, DialogConfig } from "@/components/AppContext";
import SideBar from "@/components/SideBar";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { handleA, handleB, handleC } from "@/lib/cmd";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CardBundle } from "@shared/types";
import { queries } from "@/lib/queries";

export default function App() {
  const [page, setPage] = useState<string>("chats");
  const [alertConfig, setAlertConfig] = useState<DialogConfig>();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [cmdOpen, setCmdOpen] = useState<boolean>(false);
  const [chatID, setChatID] = useState(1);
  const [cardBundles, setCardBundles] = useState<CardBundle[]>([]);
  const [cardBundle, setCardBundle] = useState<CardBundle>();

  useEffect(() => {
    syncCardBundles();
  }, []);

  const syncCardBundles = async () => {
    const res = await queries.getAllExtantCardBundles();
    if (res.kind == "err") {
      toast.error("Error fetching card bundle.");
      return;
    }
    setCardBundles(res.value);
  };

  // Open command dialog with Ctrl + K
  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      if (e.key === "k" && e.ctrlKey) {
        setCmdOpen(true);
      }
    });
  }, []);

  function createDialog(config: DialogConfig) {
    setAlertConfig(config);
    setDialogOpen(true);
  }

  function createModal(content: React.ReactNode) {
    setModalContent(content);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const numFiles = e.dataTransfer.files.length;

    if (numFiles > 1) {
      toast.info(`Importing ${numFiles} cards all at once.`);
    }
    const files = e.dataTransfer.files;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Reject files that are not .zip
        if (file.type !== "application/zip") {
          toast.error(`${file.name} is not a zip file, skipping...`);
          continue;
        }
        // Reject files larger than 50MB
        if (file.size > 5e7) {
          toast.error(`${file.name} is larger than 50MB, skipping...`);
          continue;
        }

        const path = file.path;
        const res = await window.api.blob.cards.importFromZip(path);

        if (res.kind === "err") {
          toast.error(`Error importing ${file.name}`);
          console.error("Error importing cards", res.error);
          continue;
        }
      }
      toast.success(`Imported ${numFiles} cards.`);
      syncCardBundles();
    } catch (e) {
      console.error("Error importing cards", e);
      toast.error(`Error importing cards.`);
    }
  };

  return (
    <AppContext.Provider value={{ createDialog, createModal, closeModal }}>
      <div
        className="flex h-screen bg-neutral-800 text-sm text-neutral-100 antialiased lg:text-base"
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <SideBar setPage={setPage} />

        {/* Confirmation Dialog */}
        {alertConfig && (
          <AlertDialog open={dialogOpen}>
            <AlertDialogContent
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setDialogOpen(false);
                }
              }}
            >
              <AlertDialogHeader>
                <AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
                <AlertDialogDescription>{alertConfig.description}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => {
                    alertConfig.onCancel?.();
                    setDialogOpen(false);
                  }}
                >
                  {alertConfig.cancelLabel || "Cancel"}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    alertConfig.onAction();
                    setDialogOpen(false);
                  }}
                >
                  {alertConfig.actionLabel}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Modal */}
        {modalContent && (
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent className="w-fit max-w-none border-none p-0">{modalContent}</DialogContent>
          </Dialog>
        )}

        {/* Development Command Runner */}
        {import.meta.env.DEV && (
          <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Commands">
                <CommandItem
                  onSelect={() => {
                    handleA();
                    setCmdOpen(false);
                  }}
                >
                  Run A
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    handleB();
                    setCmdOpen(false);
                  }}
                >
                  Run B
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    handleC();
                    setCmdOpen(false);
                  }}
                >
                  Run C
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </CommandDialog>
        )}

        <div className="flex h-full w-full overflow-hidden py-4">
          {page === "create" && <CreationPage setPage={setPage} syncCardBundles={syncCardBundles} />}
          {page === "edit" && <EditPage setPage={setPage} cardBundle={cardBundle} syncCardBundles={syncCardBundles} />}
          {page === "chats" && <ChatsPage chatID={chatID} setChatID={setChatID} />}
          {page === "collections" && (
            <CollectionsPage
              setPage={setPage}
              setChatID={setChatID}
              cardBundles={cardBundles}
              setCardBundle={setCardBundle}
              syncCardBundles={syncCardBundles}
            />
          )}
          {page === "settings" && <SettingsPage />}
        </div>
      </div>
    </AppContext.Provider>
  );
}
