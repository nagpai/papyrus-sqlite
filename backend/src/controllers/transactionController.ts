import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import transactionService from '../services/transactionService';
import { CreateTransactionDTO, ReturnBookDTO } from '../types';

export const borrowBook = asyncHandler(async (req: Request, res: Response) => {
  const data: CreateTransactionDTO = req.body;
  const librarianId = req.user!.id;
  const transaction = await transactionService.borrowBook(data, librarianId);

  res.status(201).json({
    success: true,
    message: 'Book borrowed successfully',
    data: transaction,
  });
});

export const returnBook = asyncHandler(async (req: Request, res: Response) => {
  const data: ReturnBookDTO = req.body;
  const librarianId = req.user!.id;
  const transaction = await transactionService.returnBook(data, librarianId);

  res.json({
    success: true,
    message: 'Book returned successfully',
    data: transaction,
  });
});

export const getTransaction = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const transaction = await transactionService.getTransactionById(id);

  res.json({
    success: true,
    data: transaction,
  });
});

export const getAllTransactions = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    status: req.query.status as 'borrowed' | 'returned' | 'overdue',
    borrower_id: req.query.borrower_id ? parseInt(req.query.borrower_id as string) : undefined,
    book_id: req.query.book_id ? parseInt(req.query.book_id as string) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
    offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
  };

  const result = await transactionService.getAllTransactions(filters);

  res.json({
    success: true,
    data: result.transactions,
    pagination: {
      total: result.total,
      limit: filters.limit,
      offset: filters.offset,
    },
  });
});

export const getOverdueTransactions = asyncHandler(async (req: Request, res: Response) => {
  const transactions = await transactionService.getOverdueTransactions();

  res.json({
    success: true,
    data: transactions,
  });
});

export const updateOverdueStatuses = asyncHandler(async (req: Request, res: Response) => {
  const updated = await transactionService.updateOverdueStatuses();

  res.json({
    success: true,
    message: `Updated ${updated} transactions to overdue status`,
    data: { updated },
  });
});

export const getTransactionStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await transactionService.getTransactionStats();

  res.json({
    success: true,
    data: stats,
  });
});
