-- Librarians table
CREATE TABLE IF NOT EXISTS librarians (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'librarian', -- 'admin', 'librarian', 'assistant'
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  genre TEXT,
  publication_date TEXT,
  publisher TEXT,
  description TEXT,
  copy_number INTEGER NOT NULL DEFAULT 1, -- For tracking multiple copies
  is_available BOOLEAN NOT NULL DEFAULT 1,
  total_times_borrowed INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  FOREIGN KEY (created_by) REFERENCES librarians(id)
);

-- Borrowers table
CREATE TABLE IF NOT EXISTS borrowers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  apartment_number TEXT NOT NULL, -- Format: A101, B2503, etc.
  wing TEXT NOT NULL CHECK(wing IN ('A', 'B', 'C', 'D')),
  floor INTEGER NOT NULL CHECK(floor >= 1 AND floor <= 27),
  unit INTEGER NOT NULL CHECK(unit >= 1 AND unit <= 4),
  email TEXT,
  phone TEXT NOT NULL,
  registration_date DATE DEFAULT (DATE('now')),
  exit_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  FOREIGN KEY (created_by) REFERENCES librarians(id),
  UNIQUE(apartment_number, full_name, is_active) -- Prevent duplicate active borrowers
);

-- Transactions table (borrowing and returning records)
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  borrower_id INTEGER NOT NULL,
  librarian_id INTEGER NOT NULL,
  borrow_date DATE NOT NULL DEFAULT (DATE('now')),
  due_date DATE NOT NULL,
  return_date DATE,
  fine_amount REAL DEFAULT 0,
  fine_paid BOOLEAN DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'borrowed' CHECK(status IN ('borrowed', 'returned', 'overdue')),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id),
  FOREIGN KEY (borrower_id) REFERENCES borrowers(id),
  FOREIGN KEY (librarian_id) REFERENCES librarians(id)
);

-- Audit log table (track all actions)
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  librarian_id INTEGER NOT NULL,
  action_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'borrow', 'return'
  entity_type TEXT NOT NULL, -- 'book', 'borrower', 'transaction', 'librarian'
  entity_id INTEGER NOT NULL,
  old_value TEXT, -- JSON string of old data
  new_value TEXT, -- JSON string of new data
  description TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (librarian_id) REFERENCES librarians(id)
);

-- Settings table (for configurable values)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER,
  FOREIGN KEY (updated_by) REFERENCES librarians(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_books_available ON books(is_available);

CREATE INDEX IF NOT EXISTS idx_borrowers_apartment ON borrowers(apartment_number);
CREATE INDEX IF NOT EXISTS idx_borrowers_wing ON borrowers(wing);
CREATE INDEX IF NOT EXISTS idx_borrowers_active ON borrowers(is_active);
CREATE INDEX IF NOT EXISTS idx_borrowers_name ON borrowers(full_name);

CREATE INDEX IF NOT EXISTS idx_transactions_borrower ON transactions(borrower_id);
CREATE INDEX IF NOT EXISTS idx_transactions_book ON transactions(book_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_due_date ON transactions(due_date);

CREATE INDEX IF NOT EXISTS idx_audit_librarian ON audit_logs(librarian_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- Insert default settings
INSERT OR IGNORE INTO settings (key, value, description) VALUES
  ('overdue_fine_per_day', '5', 'Fine amount per day for overdue books'),
  ('due_date_days', '14', 'Number of days before a book is due'),
  ('max_books_per_apartment', '3', 'Maximum books an apartment can borrow at once'),
  ('library_name', 'Apartment Block Library', 'Name of the library'),
  ('library_address', '', 'Address of the library'),
  ('library_phone', '', 'Contact phone number'),
  ('library_email', '', 'Contact email address'),
  ('notification_due_date_reminder_days', '2', 'Days before due date to send reminder'),
  ('notification_enabled', 'true', 'Enable/disable notifications');

-- Insert default admin librarian (password: admin123)
-- Note: This should be changed immediately after first login
INSERT OR IGNORE INTO librarians (id, username, password_hash, full_name, role) VALUES
  (1, 'admin', '$2a$10$rJ4qYZ9xYYxYxYYxYxYxYeqK9qK9qK9qK9qK9qK9qK9qK9qK9qK9q', 'System Administrator', 'admin');
