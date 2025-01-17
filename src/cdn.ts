import Rola from "./index";

declare global {
  interface Window {
    Rola: typeof Rola;
  }
}

if (typeof window !== "undefined") {
  window.Rola = Rola;
}
