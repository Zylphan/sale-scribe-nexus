
import {
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';

export default function CreateSaleFormHeader() {
  return (
    <DialogHeader>
      <DialogTitle>Create New Sale</DialogTitle>
      <DialogDescription>
        Fill in the details to create a new sales order.
      </DialogDescription>
    </DialogHeader>
  );
}
