import { ElectronAPI } from "@electron-toolkit/preload";

// The preload script attaches arbitrary APIs to the window object, making them available in the renderer process.
// You could declare the types of these APIs here so typescript doesn't complain.

declare global {
  interface Window {
    electron: ElectronAPI;
    api: unknown;
  }
}
