import { allQuery } from '../config/database';

export class SearchService {
  async universalSearch(query: string, limit: number = 20): Promise<{
    books: any[];
    borrowers: any[];
  }> {
    const searchTerm = `%${query}%`;

    // Search books
    const books = await allQuery(
      `SELECT id, title, author, isbn, genre, is_available, 'book' as type
       FROM books
       WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ? OR genre LIKE ?
       ORDER BY
         CASE
           WHEN title LIKE ? THEN 1
           WHEN author LIKE ? THEN 2
           ELSE 3
         END
       LIMIT ?`,
      [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, limit]
    );

    // Search borrowers
    const borrowers = await allQuery(
      `SELECT id, full_name, apartment_number, wing, phone, is_active, 'borrower' as type
       FROM borrowers
       WHERE full_name LIKE ? OR apartment_number LIKE ? OR phone LIKE ?
       ORDER BY
         CASE
           WHEN full_name LIKE ? THEN 1
           WHEN apartment_number LIKE ? THEN 2
           ELSE 3
         END
       LIMIT ?`,
      [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, limit]
    );

    return {
      books,
      borrowers,
    };
  }

  async searchBooks(filters: {
    query?: string;
    genre?: string;
    author?: string;
    available?: boolean;
    limit?: number;
  }): Promise<any[]> {
    let sql = 'SELECT * FROM books WHERE 1=1';
    const params: any[] = [];

    if (filters.query) {
      sql += ' AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)';
      const term = `%${filters.query}%`;
      params.push(term, term, term);
    }

    if (filters.genre) {
      sql += ' AND genre = ?';
      params.push(filters.genre);
    }

    if (filters.author) {
      sql += ' AND author LIKE ?';
      params.push(`%${filters.author}%`);
    }

    if (filters.available !== undefined) {
      sql += ' AND is_available = ?';
      params.push(filters.available ? 1 : 0);
    }

    sql += ' ORDER BY title LIMIT ?';
    params.push(filters.limit || 20);

    return await allQuery(sql, params);
  }

  async searchBorrowers(filters: {
    query?: string;
    wing?: string;
    apartment?: string;
    active?: boolean;
    limit?: number;
  }): Promise<any[]> {
    let sql = 'SELECT * FROM borrowers WHERE 1=1';
    const params: any[] = [];

    if (filters.query) {
      sql += ' AND (full_name LIKE ? OR apartment_number LIKE ? OR phone LIKE ?)';
      const term = `%${filters.query}%`;
      params.push(term, term, term);
    }

    if (filters.wing) {
      sql += ' AND wing = ?';
      params.push(filters.wing);
    }

    if (filters.apartment) {
      sql += ' AND apartment_number = ?';
      params.push(filters.apartment);
    }

    if (filters.active !== undefined) {
      sql += ' AND is_active = ?';
      params.push(filters.active ? 1 : 0);
    }

    sql += ' ORDER BY full_name LIMIT ?';
    params.push(filters.limit || 20);

    return await allQuery(sql, params);
  }
}

export default new SearchService();
