
import {
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface FormHeaderProps {
  transactionId: string | null;
}

export default function FormHeader({ transactionId }: FormHeaderProps) {
  return (
    <DialogHeader>
      <DialogTitle>Edit Sale #{transactionId}</DialogTitle>
    </DialogHeader>
  );
}
