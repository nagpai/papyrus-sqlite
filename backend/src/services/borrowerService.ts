import { getQuery, runQuery, allQuery } from '../config/database';
import { Borrower, CreateBorrowerDTO, UpdateBorrowerDTO, AuditLog } from '../types';
import { AppError } from '../middleware/errorHandler';
import { parseApartmentNumber } from '../utils/apartmentValidator';
import { logAudit } from '../middleware/auditLogger';

export class BorrowerService {
  async createBorrower(data: CreateBorrowerDTO, createdBy: number): Promise<Borrower> {
    const { full_name, apartment_number, email, phone, notes } = data;

    // Parse and validate apartment number
    const parsedApartment = parseApartmentNumber(apartment_number);
    if (!parsedApartment) {
      throw new AppError(
        'Invalid apartment number. Format should be: Wing(A-D) + Floor(1-27) + Unit(01-04). Example: A101, B2503',
        400
      );
    }

    const { wing, floor, unit, apartmentNumber: formattedApartment } = parsedApartment;

    // Check if borrower with same name and apartment already exists and is active
    const existing = await getQuery<Borrower>(
      'SELECT * FROM borrowers WHERE apartment_number = ? AND full_name = ? AND is_active = 1',
      [formattedApartment, full_name]
    );

    if (existing) {
      throw new AppError('An active borrower with this name already exists in this apartment', 400);
    }

    await runQuery(
      `INSERT INTO borrowers
       (full_name, apartment_number, wing, floor, unit, email, phone, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [full_name, formattedApartment, wing, floor, unit, email || null, phone, notes || null, createdBy]
    );

    const borrower = await getQuery<Borrower>(
      'SELECT * FROM borrowers WHERE id = last_insert_rowid()'
    );

    if (!borrower) {
      throw new AppError('Failed to create borrower', 500);
    }

    // Log audit
    await logAudit({
      librarianId: createdBy,
      actionType: 'create',
      entityType: 'borrower',
      entityId: borrower.id,
      newValue: borrower,
      description: `Created borrower: ${full_name} (${formattedApartment})`,
    });

    return borrower;
  }

  async updateBorrower(id: number, data: UpdateBorrowerDTO, updatedBy: number): Promise<Borrower> {
    // Get old borrower data for audit
    const oldBorrower = await this.getBorrowerById(id);

    const updates: string[] = [];
    const values: any[] = [];

    if (data.full_name !== undefined) {
      updates.push('full_name = ?');
      values.push(data.full_name);
    }

    if (data.apartment_number !== undefined) {
      const parsedApartment = parseApartmentNumber(data.apartment_number);
      if (!parsedApartment) {
        throw new AppError('Invalid apartment number format', 400);
      }

      updates.push('apartment_number = ?', 'wing = ?', 'floor = ?', 'unit = ?');
      values.push(
        parsedApartment.apartmentNumber,
        parsedApartment.wing,
        parsedApartment.floor,
        parsedApartment.unit
      );
    }

    if (data.email !== undefined) {
      updates.push('email = ?');
      values.push(data.email);
    }

    if (data.phone !== undefined) {
      updates.push('phone = ?');
      values.push(data.phone);
    }

    if (data.notes !== undefined) {
      updates.push('notes = ?');
      values.push(data.notes);
    }

    if (data.exit_date !== undefined) {
      updates.push('exit_date = ?');
      values.push(data.exit_date);
    }

    if (data.is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(data.is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      throw new AppError('No fields to update', 400);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await runQuery(
      `UPDATE borrowers SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const borrower = await this.getBorrowerById(id);

    // Log audit
    await logAudit({
      librarianId: updatedBy,
      actionType: 'update',
      entityType: 'borrower',
      entityId: id,
      oldValue: oldBorrower,
      newValue: borrower,
      description: `Updated borrower: ${borrower.full_name} (${borrower.apartment_number})`,
    });

    return borrower;
  }

  async deleteBorrower(id: number, deletedBy: number): Promise<void> {
    const borrower = await this.getBorrowerById(id);

    // Check if borrower has active borrows
    const activeBorrows = await getQuery(
      `SELECT COUNT(*) as count FROM transactions WHERE borrower_id = ? AND status = 'borrowed'`,
      [id]
    );

    if (activeBorrows && (activeBorrows as any).count > 0) {
      throw new AppError('Cannot delete borrower with active book loans', 400);
    }

    await runQuery('DELETE FROM borrowers WHERE id = ?', [id]);

    // Log audit
    await logAudit({
      librarianId: deletedBy,
      actionType: 'delete',
      entityType: 'borrower',
      entityId: id,
      oldValue: borrower,
      description: `Deleted borrower: ${borrower.full_name} (${borrower.apartment_number})`,
    });
  }

  async getBorrowerById(id: number): Promise<Borrower> {
    const borrower = await getQuery<Borrower>('SELECT * FROM borrowers WHERE id = ?', [id]);

    if (!borrower) {
      throw new AppError('Borrower not found', 404);
    }

    return borrower;
  }

  async getBorrowerWithHistory(id: number): Promise<{
    borrower: Borrower;
    borrowHistory: any[];
    currentBorrows: any[];
    auditLogs: AuditLog[];
  }> {
    const borrower = await this.getBorrowerById(id);

    // Get all borrow history
    const borrowHistory = await allQuery(
      `SELECT t.*, b.title as book_title, b.author as book_author, l.full_name as librarian_name
       FROM transactions t
       LEFT JOIN books b ON t.book_id = b.id
       LEFT JOIN librarians l ON t.librarian_id = l.id
       WHERE t.borrower_id = ?
       ORDER BY t.borrow_date DESC`,
      [id]
    );

    // Get current unreturned books
    const currentBorrows = await allQuery(
      `SELECT t.*, b.title as book_title, b.author as book_author
       FROM transactions t
       LEFT JOIN books b ON t.book_id = b.id
       WHERE t.borrower_id = ? AND t.status = 'borrowed'
       ORDER BY t.due_date ASC`,
      [id]
    );

    // Get audit logs
    const auditLogs = await allQuery<AuditLog>(
      `SELECT a.*, l.full_name as librarian_name
       FROM audit_logs a
       LEFT JOIN librarians l ON a.librarian_id = l.id
       WHERE a.entity_type = 'borrower' AND a.entity_id = ?
       ORDER BY a.created_at DESC`,
      [id]
    );

    return {
      borrower,
      borrowHistory,
      currentBorrows,
      auditLogs,
    };
  }

  async getAllBorrowers(filters?: {
    search?: string;
    wing?: string;
    apartment_number?: string;
    active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ borrowers: Borrower[]; total: number }> {
    let query = 'SELECT * FROM borrowers WHERE 1=1';
    const params: any[] = [];

    if (filters?.search) {
      query += ' AND (full_name LIKE ? OR apartment_number LIKE ? OR phone LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (filters?.wing) {
      query += ' AND wing = ?';
      params.push(filters.wing);
    }

    if (filters?.apartment_number) {
      query += ' AND apartment_number = ?';
      params.push(filters.apartment_number);
    }

    if (filters?.active !== undefined) {
      query += ' AND is_active = ?';
      params.push(filters.active ? 1 : 0);
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
    const countResult = await getQuery<{ count: number }>(countQuery, params);
    const total = countResult?.count || 0;

    // Add ordering and pagination
    query += ' ORDER BY full_name ASC';

    if (filters?.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    if (filters?.offset) {
      query += ' OFFSET ?';
      params.push(filters.offset);
    }

    const borrowers = await allQuery<Borrower>(query, params);

    return { borrowers, total };
  }

  async getActiveBorrowers(): Promise<Borrower[]> {
    const borrowers = await allQuery<Borrower>(
      `SELECT b.*, COUNT(t.id) as active_borrows
       FROM borrowers b
       LEFT JOIN transactions t ON b.id = t.borrower_id AND t.status = 'borrowed'
       WHERE b.is_active = 1
       GROUP BY b.id
       HAVING active_borrows > 0
       ORDER BY active_borrows DESC`
    );

    return borrowers;
  }

  async getApartmentBorrowCount(apartmentNumber: string): Promise<number> {
    const result = await getQuery<{ count: number }>(
      `SELECT COUNT(*) as count
       FROM transactions t
       JOIN borrowers b ON t.borrower_id = b.id
       WHERE b.apartment_number = ? AND t.status = 'borrowed'`,
      [apartmentNumber]
    );

    return result?.count || 0;
  }
}

export default new BorrowerService();
