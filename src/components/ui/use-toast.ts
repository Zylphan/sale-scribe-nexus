
import { toast } from "sonner";

export { toast };

// Re-export the toast function for backward compatibility
export const useToast = () => {
  return {
    toast
  };
};
