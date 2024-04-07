import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

import ChatsPage from "@/app/chats";
import CollectionsPage from "@/app/collections";
import SettingsPage from "@/app/settings";
import SideBar from "@/components/SideBar";
import { createContext, useContext, useState } from "react";

export interface AlertConfig {
  title: string;
  cancelLabel?: string;
  actionLabel: string;
  description: string;
  onCancel?: () => void;
  onAction: () => void;
}

interface AppContextProps {
  createAlert: (config: AlertConfig) => void;
}
const AppContext = createContext<AppContextProps | undefined>(undefined);

export default function App() {
  const [page, setPage] = useState<string>("chats");
  const [alertConfig, setAlertConfig] = useState<AlertConfig>();
  const [alertOpen, setAlertOpen] = useState<boolean>(false);

  function createAlert(config: AlertConfig) {
    setAlertConfig(config);
    setAlertOpen(true);
  }

  return (
    <AppContext.Provider value={{ createAlert }}>
      <div className="flex h-screen bg-neutral-800 pb-6 pl-6 pt-6 text-sm text-neutral-100 antialiased lg:text-base">
        <SideBar setPage={setPage} />

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
        {page === "chats" && <ChatsPage />}
        {page === "collections" && <CollectionsPage />}
        {page === "settings" && <SettingsPage />}
      </div>
    </AppContext.Provider>
  );
}

export const useApp = (): AppContextProps => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an App Provider");
  }
  return context;
};
