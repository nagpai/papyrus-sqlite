import bcrypt from 'bcryptjs';
import { getQuery, runQuery } from '../config/database';
import { Librarian, LoginDTO, CreateLibrarianDTO, UpdateLibrarianDTO } from '../types';
import { AppError } from '../middleware/errorHandler';
import { generateToken } from '../middleware/auth';

export class AuthService {
  async login(loginData: LoginDTO): Promise<{ token: string; librarian: Omit<Librarian, 'password_hash'> }> {
    const { username, password } = loginData;

    // Find librarian by username
    const librarian = await getQuery<Librarian>(
      'SELECT * FROM librarians WHERE username = ?',
      [username]
    );

    if (!librarian) {
      throw new AppError('Invalid username or password', 401);
    }

    if (!librarian.is_active) {
      throw new AppError('Account is inactive', 403);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, librarian.password_hash);
    if (!isValidPassword) {
      throw new AppError('Invalid username or password', 401);
    }

    // Generate JWT token
    const token = generateToken({
      id: librarian.id,
      username: librarian.username,
      role: librarian.role,
    });

    // Remove password hash from response
    const { password_hash, ...librarianData } = librarian;

    return {
      token,
      librarian: librarianData,
    };
  }

  async createLibrarian(data: CreateLibrarianDTO, createdBy: number): Promise<Omit<Librarian, 'password_hash'>> {
    const { username, password, full_name, email, phone, role } = data;

    // Check if username already exists
    const existing = await getQuery<Librarian>(
      'SELECT id FROM librarians WHERE username = ?',
      [username]
    );

    if (existing) {
      throw new AppError('Username already exists', 400);
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert librarian
    await runQuery(
      `INSERT INTO librarians (username, password_hash, full_name, email, phone, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, password_hash, full_name, email || null, phone || null, role]
    );

    // Get the created librarian
    const librarian = await getQuery<Librarian>(
      'SELECT * FROM librarians WHERE username = ?',
      [username]
    );

    if (!librarian) {
      throw new AppError('Failed to create librarian', 500);
    }

    const { password_hash: _, ...librarianData } = librarian;
    return librarianData;
  }

  async updateLibrarian(id: number, data: UpdateLibrarianDTO): Promise<Omit<Librarian, 'password_hash'>> {
    const { full_name, email, phone, role, is_active } = data;

    const updates: string[] = [];
    const values: any[] = [];

    if (full_name !== undefined) {
      updates.push('full_name = ?');
      values.push(full_name);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      values.push(role);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      throw new AppError('No fields to update', 400);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await runQuery(
      `UPDATE librarians SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const librarian = await getQuery<Librarian>(
      'SELECT * FROM librarians WHERE id = ?',
      [id]
    );

    if (!librarian) {
      throw new AppError('Librarian not found', 404);
    }

    const { password_hash, ...librarianData } = librarian;
    return librarianData;
  }

  async changePassword(id: number, oldPassword: string, newPassword: string): Promise<void> {
    const librarian = await getQuery<Librarian>(
      'SELECT password_hash FROM librarians WHERE id = ?',
      [id]
    );

    if (!librarian) {
      throw new AppError('Librarian not found', 404);
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, librarian.password_hash);
    if (!isValidPassword) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await runQuery(
      'UPDATE librarians SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPasswordHash, id]
    );
  }

  async getLibrarianById(id: number): Promise<Omit<Librarian, 'password_hash'>> {
    const librarian = await getQuery<Librarian>(
      'SELECT * FROM librarians WHERE id = ?',
      [id]
    );

    if (!librarian) {
      throw new AppError('Librarian not found', 404);
    }

    const { password_hash, ...librarianData } = librarian;
    return librarianData;
  }

  async getAllLibrarians(): Promise<Omit<Librarian, 'password_hash'>[]> {
    const librarians = await new Promise<Librarian[]>((resolve, reject) => {
      const db = require('../config/database').default;
      db.all('SELECT * FROM librarians ORDER BY created_at DESC', (err: Error, rows: Librarian[]) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    return librarians.map(({ password_hash, ...librarianData }) => librarianData);
  }
}

export default new AuthService();
