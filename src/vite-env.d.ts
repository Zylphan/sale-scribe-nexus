
/// <reference types="vite/client" />
/// <reference types="html2canvas" />

// Add user_permissions table type information
interface Database {
  public: {
    Tables: {
      user_permissions: {
        Row: {
          id: string;
          user_id: string;
          can_create_sales: boolean;
          can_edit_sales: boolean;
          can_delete_sales: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          can_create_sales?: boolean;
          can_edit_sales?: boolean;
          can_delete_sales?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          can_create_sales?: boolean;
          can_edit_sales?: boolean;
          can_delete_sales?: boolean;
          updated_at?: string;
        };
      };
    };
  };
}
