
export interface Sale {
  transno: string;
  salesdate: string | null;
  custno: string | null;
  empno: string | null;
  customer?: {
    custname: string | null;
  };
  employee?: {
    firstname: string | null;
    lastname: string | null;
  };
}

export interface SalesDetail {
  transno: string;
  prodcode: string;
  quantity: number | null;
  // Extended properties from joins
  product_description?: string | null;
  product_unit?: string | null;
  unit_price?: number | null;
  customer_name?: string | null;
  employee_name?: string | null;
  salesdate?: string | null;
}
