import { create } from "zustand";

interface ChatState {
  syncMessageHistory: () => Promise<void>;
  setSyncMessageHistory: (fn: () => Promise<void>) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  syncMessageHistory: async () => {},
  setSyncMessageHistory: (fn) => set({ syncMessageHistory: fn })
}));
