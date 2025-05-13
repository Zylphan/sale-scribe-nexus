
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

interface FormFooterProps {
  onCancel: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function FormFooter({ onCancel, isLoading, disabled = false }: FormFooterProps) {
  return (
    <DialogFooter>
      <Button variant="outline" type="button" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={isLoading || disabled}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <Save className="mr-2 h-4 w-4" />
        Save Changes
      </Button>
    </DialogFooter>
  );
}
