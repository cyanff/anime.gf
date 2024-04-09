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
import SettingsPage from "@/app/settings";
import { DialogConfig, AppContext } from "@/components/AppContext";
import SideBar from "@/components/SideBar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";

export default function App() {
  const [page, setPage] = useState<string>("chats");
  const [alertConfig, setAlertConfig] = useState<DialogConfig>();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const [modalContent, setModalContent] = useState<React.ReactNode>();
  const [modalOpen, setModalOpen] = useState<boolean>(false);

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
            <DialogContent className="">{modalContent}</DialogContent>
          </Dialog>
        )}

        <div className="flex h-full w-full py-4">
          {page === "chats" && <ChatsPage />}
          {page === "collections" && <CollectionsPage />}
          {page === "settings" && <SettingsPage />}
        </div>
      </div>
    </AppContext.Provider>
  );
}
