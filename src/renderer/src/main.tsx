import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/app";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <App />
      <Toaster position="top-right" />
    </ThemeProvider>
  </React.StrictMode>
);
