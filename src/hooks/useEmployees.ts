
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Employee {
  empno: string;
  firstname: string;
  lastname: string;
  birthdate: string | null;
  gender: string | null;
  hiredate: string | null;
  sepdate: string | null;
}

export function useEmployees(searchQuery: string = '') {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        
        let query = supabase.from('employee').select('*');
        
        if (searchQuery) {
          query = query.or(`empno.ilike.%${searchQuery}%,firstname.ilike.%${searchQuery}%,lastname.ilike.%${searchQuery}%`);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        setEmployees(data || []);
      } catch (error: any) {
        toast.error(`Error fetching employees: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [searchQuery]);

  return { employees, loading };
}
