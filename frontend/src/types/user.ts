export interface User {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
  is_superuser: boolean;
  avatar?: string;
  created_at: string;
  updated_at: string;
} 