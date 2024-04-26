import { createContext, useContext } from "react";

export interface DialogConfig {
  title: string;
  cancelLabel?: string;
  actionLabel: string;
  description: string;
  onCancel?: () => void;
  onAction: () => void;
}

interface AppContextProps {
  createDialog: (config: DialogConfig) => void;
  createModal: (config: React.ReactNode) => void;
  closeModal: () => void;
  setActiveChatID: (id: number) => void;
  syncCardBundles: () => void;
  setPage(page: string): void;
}

export const AppContext = createContext<AppContextProps>({} as AppContextProps);
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an App Provider");
  }
  return context;
}
