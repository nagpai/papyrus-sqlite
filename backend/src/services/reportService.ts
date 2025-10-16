import { allQuery, getQuery } from '../config/database';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';
import fs from 'fs';

export class ReportService {
  private ensureTempDir(): string {
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    return tempDir;
  }

  async getMostBorrowedBooks(limit: number = 10): Promise<any[]> {
    return await allQuery(
      `SELECT b.id, b.title, b.author, b.isbn, b.genre,
              COUNT(t.id) as borrow_count,
              b.total_times_borrowed
       FROM books b
       LEFT JOIN transactions t ON b.id = t.book_id
       GROUP BY b.id
       ORDER BY borrow_count DESC, b.total_times_borrowed DESC
       LIMIT ?`,
      [limit]
    );
  }

  async getActiveBorrowers(): Promise<any[]> {
    return await allQuery(
      `SELECT br.id, br.full_name, br.apartment_number, br.wing, br.phone,
              COUNT(t.id) as active_borrows,
              GROUP_CONCAT(b.title, ', ') as borrowed_books
       FROM borrowers br
       LEFT JOIN transactions t ON br.id = t.borrower_id AND t.status = 'borrowed'
       LEFT JOIN books b ON t.book_id = b.id
       WHERE br.is_active = 1
       GROUP BY br.id
       HAVING active_borrows > 0
       ORDER BY active_borrows DESC`
    );
  }

  async getOverdueBooks(): Promise<any[]> {
    return await allQuery(
      `SELECT t.id, t.borrow_date, t.due_date,
              CAST((julianday('now') - julianday(t.due_date)) AS INTEGER) as days_overdue,
              b.title, b.author,
              br.full_name as borrower_name, br.apartment_number, br.phone as borrower_phone,
              l.full_name as librarian_name
       FROM transactions t
       LEFT JOIN books b ON t.book_id = b.id
       LEFT JOIN borrowers br ON t.borrower_id = br.id
       LEFT JOIN librarians l ON t.librarian_id = l.id
       WHERE t.status IN ('borrowed', 'overdue') AND DATE(t.due_date) < DATE('now')
       ORDER BY days_overdue DESC`
    );
  }

  async getLibrarianActivity(startDate?: string, endDate?: string): Promise<any[]> {
    let sql = `
      SELECT l.id, l.username, l.full_name,
             a.action_type, a.entity_type, a.description, a.created_at
      FROM audit_logs a
      LEFT JOIN librarians l ON a.librarian_id = l.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (startDate) {
      sql += ' AND DATE(a.created_at) >= DATE(?)';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND DATE(a.created_at) <= DATE(?)';
      params.push(endDate);
    }

    sql += ' ORDER BY a.created_at DESC';

    return await allQuery(sql, params);
  }

  async getLibrarianStats(): Promise<any[]> {
    return await allQuery(
      `SELECT l.id, l.full_name, l.role,
              COUNT(DISTINCT CASE WHEN a.action_type = 'borrow' THEN a.id END) as borrows_processed,
              COUNT(DISTINCT CASE WHEN a.action_type = 'return' THEN a.id END) as returns_processed,
              COUNT(DISTINCT CASE WHEN a.action_type = 'create' AND a.entity_type = 'book' THEN a.id END) as books_added,
              COUNT(DISTINCT CASE WHEN a.action_type = 'create' AND a.entity_type = 'borrower' THEN a.id END) as borrowers_registered,
              COUNT(DISTINCT a.id) as total_actions
       FROM librarians l
       LEFT JOIN audit_logs a ON l.id = a.librarian_id
       WHERE l.is_active = 1
       GROUP BY l.id
       ORDER BY total_actions DESC`
    );
  }

  async getLibraryStats(): Promise<{
    totalBooks: number;
    availableBooks: number;
    borrowedBooks: number;
    totalBorrowers: number;
    activeBorrowers: number;
    overdueBooks: number;
    totalTransactions: number;
  }> {
    const bookStats = await getQuery<any>(
      'SELECT COUNT(*) as total, SUM(is_available) as available FROM books'
    );

    const borrowerStats = await getQuery<any>(
      'SELECT COUNT(*) as total, SUM(is_active) as active FROM borrowers'
    );

    const overdueCount = await getQuery<any>(
      "SELECT COUNT(*) as count FROM transactions WHERE status IN ('borrowed', 'overdue') AND DATE(due_date) < DATE('now')"
    );

    const transactionCount = await getQuery<any>('SELECT COUNT(*) as count FROM transactions');

    return {
      totalBooks: bookStats?.total || 0,
      availableBooks: bookStats?.available || 0,
      borrowedBooks: (bookStats?.total || 0) - (bookStats?.available || 0),
      totalBorrowers: borrowerStats?.total || 0,
      activeBorrowers: borrowerStats?.active || 0,
      overdueBooks: overdueCount?.count || 0,
      totalTransactions: transactionCount?.count || 0,
    };
  }

  async exportMostBorrowedBooksToCSV(limit: number = 10): Promise<string> {
    const data = await this.getMostBorrowedBooks(limit);
    const tempDir = this.ensureTempDir();
    const filename = `most_borrowed_books_${Date.now()}.csv`;
    const filepath = path.join(tempDir, filename);

    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'id', title: 'Book ID' },
        { id: 'title', title: 'Title' },
        { id: 'author', title: 'Author' },
        { id: 'isbn', title: 'ISBN' },
        { id: 'genre', title: 'Genre' },
        { id: 'borrow_count', title: 'Times Borrowed' },
      ],
    });

    await csvWriter.writeRecords(data);
    return filepath;
  }

  async exportOverdueBooksToCSV(): Promise<string> {
    const data = await this.getOverdueBooks();
    const tempDir = this.ensureTempDir();
    const filename = `overdue_books_${Date.now()}.csv`;
    const filepath = path.join(tempDir, filename);

    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'id', title: 'Transaction ID' },
        { id: 'title', title: 'Book Title' },
        { id: 'author', title: 'Author' },
        { id: 'borrower_name', title: 'Borrower Name' },
        { id: 'apartment_number', title: 'Apartment' },
        { id: 'borrower_phone', title: 'Phone' },
        { id: 'borrow_date', title: 'Borrow Date' },
        { id: 'due_date', title: 'Due Date' },
        { id: 'days_overdue', title: 'Days Overdue' },
      ],
    });

    await csvWriter.writeRecords(data);
    return filepath;
  }

  async exportLibrarianActivityToCSV(startDate?: string, endDate?: string): Promise<string> {
    const data = await this.getLibrarianActivity(startDate, endDate);
    const tempDir = this.ensureTempDir();
    const filename = `librarian_activity_${Date.now()}.csv`;
    const filepath = path.join(tempDir, filename);

    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'full_name', title: 'Librarian Name' },
        { id: 'action_type', title: 'Action Type' },
        { id: 'entity_type', title: 'Entity Type' },
        { id: 'description', title: 'Description' },
        { id: 'created_at', title: 'Date/Time' },
      ],
    });

    await csvWriter.writeRecords(data);
    return filepath;
  }
}

export default new ReportService();
