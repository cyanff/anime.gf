import { API } from "./index";

declare global {
  interface Window {
    api: API;
  }
}
