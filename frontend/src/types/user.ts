export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  is_superuser: boolean;
  avatar?: string;
  created_at: string;
  updated_at: string;
} 