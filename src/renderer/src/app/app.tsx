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

export default function App() {
  const [page, setPage] = useState<string>("chats");
  const [alertConfig, setAlertConfig] = useState<DialogConfig>();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [cmdOpen, setCmdOpen] = useState<boolean>(false);
  const [chatID, setChatID] = useState(1);

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

  return (
    <AppContext.Provider value={{ createDialog, createModal, closeModal }}>
      <div className="flex h-screen bg-neutral-800 text-sm text-neutral-100 antialiased lg:text-base">
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

        <div className="flex h-full w-full py-4">
          {page === "chats" && <ChatsPage chatID={chatID} setChatID={setChatID} />}
          {page === "collections" && <CollectionsPage setPage={setPage} setChatID={setChatID} />}
          {page === "settings" && <SettingsPage />}
        </div>
      </div>
    </AppContext.Provider>
  );
}
