import fs from 'fs';
import path from 'path';
import db, { runQuery } from './database';
import bcrypt from 'bcryptjs';

export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('Initializing database...');

    // Read and execute schema SQL
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      // Skip the INSERT for default admin (we'll handle it separately with proper hash)
      if (statement.includes("INSERT OR IGNORE INTO librarians")) {
        continue;
      }
      await runQuery(statement);
    }

    // Create default admin with properly hashed password
    const defaultPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    await runQuery(
      `INSERT OR IGNORE INTO librarians (id, username, password_hash, full_name, role)
       VALUES (1, 'admin', ?, 'System Administrator', 'admin')`,
      [hashedPassword]
    );

    console.log('Database initialized successfully');
    console.log('Default admin credentials: username=admin, password=admin123');
    console.log('IMPORTANT: Please change the admin password after first login!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Check if database needs initialization
export const checkDatabaseInitialization = async (): Promise<boolean> => {
  try {
    const result = await new Promise<any>((resolve, reject) => {
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='librarians'", (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    return !!result;
  } catch (error) {
    return false;
  }
};
