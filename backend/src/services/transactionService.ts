import { getQuery, runQuery, allQuery } from '../config/database';
import { Transaction, CreateTransactionDTO, ReturnBookDTO } from '../types';
import { AppError } from '../middleware/errorHandler';
import { logAudit } from '../middleware/auditLogger';
import { addDays, formatDate, calculateFine } from '../utils/dateUtils';
import borrowerService from './borrowerService';
import bookService from './bookService';

export class TransactionService {
  async borrowBook(data: CreateTransactionDTO, librarianId: number): Promise<Transaction> {
    const { book_id, borrower_id, notes } = data;

    // Verify book exists and is available
    const book = await bookService.getBookById(book_id);
    if (!book.is_available) {
      throw new AppError('Book is not available for borrowing', 400);
    }

    // Verify borrower exists and is active
    const borrower = await borrowerService.getBorrowerById(borrower_id);
    if (!borrower.is_active) {
      throw new AppError('Borrower account is inactive', 400);
    }

    // Check apartment borrow limit
    const apartmentBorrowCount = await borrowerService.getApartmentBorrowCount(
      borrower.apartment_number
    );

    // Get max books per apartment from settings
    const maxBooksResult = await getQuery<{ value: string }>(
      "SELECT value FROM settings WHERE key = 'max_books_per_apartment'"
    );
    const maxBooks = parseInt(maxBooksResult?.value || '3');

    if (apartmentBorrowCount >= maxBooks) {
      throw new AppError(
        `Apartment ${borrower.apartment_number} has reached the maximum borrowing limit of ${maxBooks} books`,
        400
      );
    }

    // Get due date days from settings
    const dueDateDaysResult = await getQuery<{ value: string }>(
      "SELECT value FROM settings WHERE key = 'due_date_days'"
    );
    const dueDateDays = parseInt(dueDateDaysResult?.value || '14');

    // Calculate due date
    const borrowDate = new Date();
    const dueDate = addDays(borrowDate, dueDateDays);

    // Create transaction
    await runQuery(
      `INSERT INTO transactions
       (book_id, borrower_id, librarian_id, borrow_date, due_date, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, 'borrowed')`,
      [book_id, borrower_id, librarianId, formatDate(borrowDate), formatDate(dueDate), notes || null]
    );

    // Mark book as unavailable
    await runQuery('UPDATE books SET is_available = 0 WHERE id = ?', [book_id]);

    const transaction = await getQuery<Transaction>(
      'SELECT * FROM transactions WHERE id = last_insert_rowid()'
    );

    if (!transaction) {
      throw new AppError('Failed to create transaction', 500);
    }

    // Increment book borrow count
    await runQuery(
      'UPDATE books SET total_times_borrowed = total_times_borrowed + 1 WHERE id = ?',
      [book_id]
    );

    // Log audit
    await logAudit({
      librarianId,
      actionType: 'borrow',
      entityType: 'transaction',
      entityId: transaction.id,
      newValue: transaction,
      description: `${borrower.full_name} borrowed "${book.title}"`,
    });

    return transaction;
  }

  async returnBook(data: ReturnBookDTO, librarianId: number): Promise<Transaction> {
    const { transaction_id, fine_paid, notes } = data;

    // Get transaction
    const transaction = await this.getTransactionById(transaction_id);

    if (transaction.status === 'returned') {
      throw new AppError('Book has already been returned', 400);
    }

    // Get fine per day from settings
    const finePerDayResult = await getQuery<{ value: string }>(
      "SELECT value FROM settings WHERE key = 'overdue_fine_per_day'"
    );
    const finePerDay = parseFloat(finePerDayResult?.value || '5');

    // Calculate fine
    const fine = calculateFine(transaction.due_date, finePerDay);

    const returnDate = formatDate(new Date());

    // Update transaction
    await runQuery(
      `UPDATE transactions
       SET return_date = ?, status = 'returned', fine_amount = ?, fine_paid = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [returnDate, fine, fine_paid ? 1 : 0, notes || transaction.notes, transaction_id]
    );

    // Mark book as available
    await runQuery('UPDATE books SET is_available = 1 WHERE id = ?', [transaction.book_id]);

    const updatedTransaction = await this.getTransactionById(transaction_id);

    // Get book and borrower details for audit
    const book = await bookService.getBookById(transaction.book_id);
    const borrower = await borrowerService.getBorrowerById(transaction.borrower_id);

    // Log audit
    await logAudit({
      librarianId,
      actionType: 'return',
      entityType: 'transaction',
      entityId: transaction_id,
      oldValue: transaction,
      newValue: updatedTransaction,
      description: `${borrower.full_name} returned "${book.title}"${fine > 0 ? ` (Fine: $${fine})` : ''}`,
    });

    return updatedTransaction;
  }

  async getTransactionById(id: number): Promise<Transaction> {
    const transaction = await getQuery<Transaction>('SELECT * FROM transactions WHERE id = ?', [id]);

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    return transaction;
  }

  async getAllTransactions(filters?: {
    status?: 'borrowed' | 'returned' | 'overdue';
    borrower_id?: number;
    book_id?: number;
    limit?: number;
    offset?: number;
  }): Promise<{ transactions: any[]; total: number }> {
    let query = `
      SELECT t.*,
             b.title as book_title, b.author as book_author,
             br.full_name as borrower_name, br.apartment_number,
             l.full_name as librarian_name
      FROM transactions t
      LEFT JOIN books b ON t.book_id = b.id
      LEFT JOIN borrowers br ON t.borrower_id = br.id
      LEFT JOIN librarians l ON t.librarian_id = l.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.status) {
      query += ' AND t.status = ?';
      params.push(filters.status);
    }

    if (filters?.borrower_id) {
      query += ' AND t.borrower_id = ?';
      params.push(filters.borrower_id);
    }

    if (filters?.book_id) {
      query += ' AND t.book_id = ?';
      params.push(filters.book_id);
    }

    // Get total count
    const countQuery = query.replace(
      'SELECT t.*, b.title as book_title, b.author as book_author, br.full_name as borrower_name, br.apartment_number, l.full_name as librarian_name',
      'SELECT COUNT(*) as count'
    );
    const countResult = await getQuery<{ count: number }>(countQuery, params);
    const total = countResult?.count || 0;

    // Add ordering and pagination
    query += ' ORDER BY t.borrow_date DESC';

    if (filters?.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    if (filters?.offset) {
      query += ' OFFSET ?';
      params.push(filters.offset);
    }

    const transactions = await allQuery(query, params);

    return { transactions, total };
  }

  async getOverdueTransactions(): Promise<any[]> {
    const transactions = await allQuery(
      `SELECT t.*,
              b.title as book_title, b.author as book_author,
              br.full_name as borrower_name, br.apartment_number, br.phone as borrower_phone, br.email as borrower_email
       FROM transactions t
       LEFT JOIN books b ON t.book_id = b.id
       LEFT JOIN borrowers br ON t.borrower_id = br.id
       WHERE t.status = 'borrowed' AND DATE(t.due_date) < DATE('now')
       ORDER BY t.due_date ASC`
    );

    return transactions;
  }

  async updateOverdueStatuses(): Promise<number> {
    // Update all borrowed transactions with past due dates to overdue
    await runQuery(
      `UPDATE transactions
       SET status = 'overdue'
       WHERE status = 'borrowed' AND DATE(due_date) < DATE('now')`
    );

    const result = await getQuery<{ changes: number }>(
      'SELECT changes() as changes'
    );

    return result?.changes || 0;
  }

  async getTransactionStats(): Promise<{
    totalBorrowed: number;
    totalReturned: number;
    totalOverdue: number;
    activeBorrows: number;
  }> {
    const stats = await getQuery<any>(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) as returned,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue,
        SUM(CASE WHEN status = 'borrowed' THEN 1 ELSE 0 END) as borrowed
       FROM transactions`
    );

    return {
      totalBorrowed: stats?.total || 0,
      totalReturned: stats?.returned || 0,
      totalOverdue: stats?.overdue || 0,
      activeBorrows: stats?.borrowed || 0,
    };
  }
}

export default new TransactionService();
