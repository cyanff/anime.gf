import { createTRPCProxyClient } from "@trpc/client";
import { ipcLink } from "electron-trpc/renderer";
import type { AppRouter } from "../../../main/router";

interface SandboxProps {}
export default function Sandbox({}: SandboxProps) {
  return (
    <div className="flex h-full w-full rounded-xl ">
      <p></p>

      <button onClick={() => {}}></button>
    </div>
  );
}
