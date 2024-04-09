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
import { AlertConfig, AppContext } from "@/components/AppContext";
import SideBar from "@/components/SideBar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";

export default function App() {
  const [page, setPage] = useState<string>("chats");
  const [alertConfig, setAlertConfig] = useState<AlertConfig>();
  const [alertOpen, setAlertOpen] = useState<boolean>(false);

  const [modalContent, setModalContent] = useState<React.ReactNode>();
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  function createAlert(config: AlertConfig) {
    setAlertConfig(config);
    setAlertOpen(true);
  }

  function createModal(content: React.ReactNode) {
    setModalContent(content);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
  }

  return (
    <AppContext.Provider value={{ createAlert, createModal, closeModal }}>
      <div className="flex h-screen bg-neutral-800 text-sm text-neutral-100 antialiased lg:text-base">
        <SideBar setPage={setPage} />

        {/* Confirmation Dialog */}
        {alertConfig && (
          <AlertDialog open={alertOpen}>
            <AlertDialogContent
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setAlertOpen(false);
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
                    setAlertOpen(false);
                  }}
                >
                  {alertConfig.cancelLabel || "Cancel"}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    alertConfig.onAction();
                    setAlertOpen(false);
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
            <DialogContent className="w-fit max-w-none p-0 border-none">{modalContent}</DialogContent>
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
