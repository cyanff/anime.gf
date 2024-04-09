import { createContext, useContext } from "react";

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
  createModal: (config: React.ReactNode) => void;
  closeModal: () => void;
}

export const AppContext = createContext<AppContextProps>({} as AppContextProps);
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an App Provider");
  }
  return context;
}
