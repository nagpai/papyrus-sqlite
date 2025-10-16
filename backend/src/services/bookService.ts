import { getQuery, runQuery, allQuery } from '../config/database';
import { Book, CreateBookDTO, UpdateBookDTO, AuditLog } from '../types';
import { AppError } from '../middleware/errorHandler';
import { logAudit } from '../middleware/auditLogger';

export class BookService {
  async createBook(data: CreateBookDTO, createdBy: number): Promise<Book> {
    const {
      title,
      author,
      isbn,
      genre,
      publication_date,
      publisher,
      description,
      copy_number = 1,
    } = data;

    await runQuery(
      `INSERT INTO books
       (title, author, isbn, genre, publication_date, publisher, description, copy_number, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, author, isbn || null, genre || null, publication_date || null, publisher || null, description || null, copy_number, createdBy]
    );

    const book = await getQuery<Book>(
      'SELECT * FROM books WHERE id = last_insert_rowid()'
    );

    if (!book) {
      throw new AppError('Failed to create book', 500);
    }

    // Log audit
    await logAudit({
      librarianId: createdBy,
      actionType: 'create',
      entityType: 'book',
      entityId: book.id,
      newValue: book,
      description: `Created book: ${title}`,
    });

    return book;
  }

  async updateBook(id: number, data: UpdateBookDTO, updatedBy: number): Promise<Book> {
    // Get old book data for audit
    const oldBook = await this.getBookById(id);

    const updates: string[] = [];
    const values: any[] = [];

    const fields = ['title', 'author', 'isbn', 'genre', 'publication_date', 'publisher', 'description', 'copy_number', 'is_available'];

    for (const field of fields) {
      if (data[field as keyof UpdateBookDTO] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(data[field as keyof UpdateBookDTO]);
      }
    }

    if (updates.length === 0) {
      throw new AppError('No fields to update', 400);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await runQuery(
      `UPDATE books SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const book = await this.getBookById(id);

    // Log audit
    await logAudit({
      librarianId: updatedBy,
      actionType: 'update',
      entityType: 'book',
      entityId: id,
      oldValue: oldBook,
      newValue: book,
      description: `Updated book: ${book.title}`,
    });

    return book;
  }

  async deleteBook(id: number, deletedBy: number): Promise<void> {
    const book = await this.getBookById(id);

    // Check if book is currently borrowed
    const borrowedTransaction = await getQuery(
      `SELECT id FROM transactions WHERE book_id = ? AND status = 'borrowed'`,
      [id]
    );

    if (borrowedTransaction) {
      throw new AppError('Cannot delete book that is currently borrowed', 400);
    }

    await runQuery('DELETE FROM books WHERE id = ?', [id]);

    // Log audit
    await logAudit({
      librarianId: deletedBy,
      actionType: 'delete',
      entityType: 'book',
      entityId: id,
      oldValue: book,
      description: `Deleted book: ${book.title}`,
    });
  }

  async getBookById(id: number): Promise<Book> {
    const book = await getQuery<Book>('SELECT * FROM books WHERE id = ?', [id]);

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    return book;
  }

  async getBookWithHistory(id: number): Promise<{
    book: Book;
    borrowHistory: any[];
    auditLogs: AuditLog[];
  }> {
    const book = await this.getBookById(id);

    // Get borrow history
    const borrowHistory = await allQuery(
      `SELECT t.*, b.full_name as borrower_name, b.apartment_number, l.full_name as librarian_name
       FROM transactions t
       LEFT JOIN borrowers b ON t.borrower_id = b.id
       LEFT JOIN librarians l ON t.librarian_id = l.id
       WHERE t.book_id = ?
       ORDER BY t.borrow_date DESC`,
      [id]
    );

    // Get audit logs
    const auditLogs = await allQuery<AuditLog>(
      `SELECT a.*, l.full_name as librarian_name
       FROM audit_logs a
       LEFT JOIN librarians l ON a.librarian_id = l.id
       WHERE a.entity_type = 'book' AND a.entity_id = ?
       ORDER BY a.created_at DESC`,
      [id]
    );

    return {
      book,
      borrowHistory,
      auditLogs,
    };
  }

  async getAllBooks(filters?: {
    search?: string;
    genre?: string;
    author?: string;
    available?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ books: Book[]; total: number }> {
    let query = 'SELECT * FROM books WHERE 1=1';
    const params: any[] = [];

    if (filters?.search) {
      query += ' AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (filters?.genre) {
      query += ' AND genre = ?';
      params.push(filters.genre);
    }

    if (filters?.author) {
      query += ' AND author LIKE ?';
      params.push(`%${filters.author}%`);
    }

    if (filters?.available !== undefined) {
      query += ' AND is_available = ?';
      params.push(filters.available ? 1 : 0);
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
    const countResult = await getQuery<{ count: number }>(countQuery, params);
    const total = countResult?.count || 0;

    // Add ordering and pagination
    query += ' ORDER BY title ASC';

    if (filters?.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    if (filters?.offset) {
      query += ' OFFSET ?';
      params.push(filters.offset);
    }

    const books = await allQuery<Book>(query, params);

    return { books, total };
  }

  async getMostBorrowedBooks(limit: number = 10): Promise<any[]> {
    const books = await allQuery(
      `SELECT b.*, COUNT(t.id) as borrow_count
       FROM books b
       LEFT JOIN transactions t ON b.id = t.book_id
       GROUP BY b.id
       ORDER BY borrow_count DESC
       LIMIT ?`,
      [limit]
    );

    return books;
  }

  async getGenres(): Promise<string[]> {
    const genres = await allQuery<{ genre: string }>(
      'SELECT DISTINCT genre FROM books WHERE genre IS NOT NULL ORDER BY genre'
    );

    return genres.map(g => g.genre);
  }
}

export default new BookService();
