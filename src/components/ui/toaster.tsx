
// This file is kept for backward compatibility but its functionality 
// has been replaced by the direct import from sonner in App.tsx
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return null; // Return null to avoid double-rendering toasts
}
