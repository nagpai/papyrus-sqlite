import { Request, Response, NextFunction } from 'express';
import { runQuery } from '../config/database';
import { JWTPayload } from '../types';

export interface AuditLogData {
  librarianId: number;
  actionType: 'create' | 'update' | 'delete' | 'borrow' | 'return';
  entityType: 'book' | 'borrower' | 'transaction' | 'librarian';
  entityId: number;
  oldValue?: any;
  newValue?: any;
  description?: string;
  ipAddress?: string;
}

export const logAudit = async (data: AuditLogData): Promise<void> => {
  try {
    const {
      librarianId,
      actionType,
      entityType,
      entityId,
      oldValue,
      newValue,
      description,
      ipAddress,
    } = data;

    await runQuery(
      `INSERT INTO audit_logs
       (librarian_id, action_type, entity_type, entity_id, old_value, new_value, description, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        librarianId,
        actionType,
        entityType,
        entityId,
        oldValue ? JSON.stringify(oldValue) : null,
        newValue ? JSON.stringify(newValue) : null,
        description,
        ipAddress,
      ]
    );
  } catch (error) {
    console.error('Error logging audit:', error);
    // Don't throw - audit logging should not break the main flow
  }
};

export const auditMiddleware = (
  actionType: 'create' | 'update' | 'delete' | 'borrow' | 'return',
  entityType: 'book' | 'borrower' | 'transaction' | 'librarian'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to log after successful response
    res.json = function (data: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const user = req.user as JWTPayload;
        if (user && data && (data.id || data.data?.id)) {
          const entityId = data.id || data.data?.id;
          logAudit({
            librarianId: user.id,
            actionType,
            entityType,
            entityId,
            newValue: data,
            ipAddress: req.ip,
          }).catch(err => console.error('Audit log error:', err));
        }
      }
      return originalJson(data);
    };

    next();
  };
};
