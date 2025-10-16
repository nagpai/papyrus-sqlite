// Common types used across the application

export interface Librarian {
  id: number;
  username: string;
  password_hash: string;
  full_name: string;
  email?: string;
  phone?: string;
  role: 'admin' | 'librarian' | 'assistant';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn?: string;
  genre?: string;
  publication_date?: string;
  publisher?: string;
  description?: string;
  copy_number: number;
  is_available: boolean;
  total_times_borrowed: number;
  created_at: string;
  updated_at: string;
  created_by: number;
}

export interface Borrower {
  id: number;
  full_name: string;
  apartment_number: string;
  wing: 'A' | 'B' | 'C' | 'D';
  floor: number;
  unit: number;
  email?: string;
  phone: string;
  registration_date: string;
  exit_date?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: number;
}

export interface Transaction {
  id: number;
  book_id: number;
  borrower_id: number;
  librarian_id: number;
  borrow_date: string;
  due_date: string;
  return_date?: string;
  fine_amount: number;
  fine_paid: boolean;
  status: 'borrowed' | 'returned' | 'overdue';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  librarian_id: number;
  action_type: 'create' | 'update' | 'delete' | 'borrow' | 'return';
  entity_type: 'book' | 'borrower' | 'transaction' | 'librarian';
  entity_id: number;
  old_value?: string;
  new_value?: string;
  description?: string;
  ip_address?: string;
  created_at: string;
}

export interface Setting {
  key: string;
  value: string;
  description?: string;
  updated_at: string;
  updated_by?: number;
}

export interface JWTPayload {
  id: number;
  username: string;
  role: string;
}

// DTOs for API requests
export interface CreateBookDTO {
  title: string;
  author: string;
  isbn?: string;
  genre?: string;
  publication_date?: string;
  publisher?: string;
  description?: string;
  copy_number?: number;
}

export interface UpdateBookDTO extends Partial<CreateBookDTO> {
  is_available?: boolean;
}

export interface CreateBorrowerDTO {
  full_name: string;
  apartment_number: string;
  email?: string;
  phone: string;
  notes?: string;
}

export interface UpdateBorrowerDTO extends Partial<CreateBorrowerDTO> {
  exit_date?: string;
  is_active?: boolean;
}

export interface CreateTransactionDTO {
  book_id: number;
  borrower_id: number;
  notes?: string;
}

export interface ReturnBookDTO {
  transaction_id: number;
  fine_paid?: boolean;
  notes?: string;
}

export interface LoginDTO {
  username: string;
  password: string;
}

export interface CreateLibrarianDTO {
  username: string;
  password: string;
  full_name: string;
  email?: string;
  phone?: string;
  role: 'admin' | 'librarian' | 'assistant';
}

export interface UpdateLibrarianDTO {
  full_name?: string;
  email?: string;
  phone?: string;
  role?: 'admin' | 'librarian' | 'assistant';
  is_active?: boolean;
}

export interface SearchQuery {
  q?: string;
  type?: 'books' | 'borrowers' | 'all';
  wing?: string;
  genre?: string;
  status?: string;
  limit?: number;
  offset?: number;
}
