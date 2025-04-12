
import { z } from 'zod';

export const formSchema = z.object({
  transno: z.string(),
  salesdate: z.date(),
  custno: z.string().min(1, { message: "Customer is required" }),
  empno: z.string().min(1, { message: "Employee is required" }),
  details: z.array(z.object({
    prodcode: z.string().min(1, { message: "Product is required" }),
    quantity: z.number().min(1, { message: "Quantity must be at least 1" }),
    unitprice: z.number().optional(),
  })).min(1, { message: "At least one product is required" })
});

export type FormValues = z.infer<typeof formSchema>;
