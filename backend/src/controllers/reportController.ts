import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import reportService from '../services/reportService';
import fs from 'fs';

export const getMostBorrowedBooks = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
  const books = await reportService.getMostBorrowedBooks(limit);

  res.json({
    success: true,
    data: books,
  });
});

export const getActiveBorrowers = asyncHandler(async (req: Request, res: Response) => {
  const borrowers = await reportService.getActiveBorrowers();

  res.json({
    success: true,
    data: borrowers,
  });
});

export const getOverdueBooks = asyncHandler(async (req: Request, res: Response) => {
  const books = await reportService.getOverdueBooks();

  res.json({
    success: true,
    data: books,
  });
});

export const getLibrarianActivity = asyncHandler(async (req: Request, res: Response) => {
  const startDate = req.query.start_date as string;
  const endDate = req.query.end_date as string;

  const activity = await reportService.getLibrarianActivity(startDate, endDate);

  res.json({
    success: true,
    data: activity,
  });
});

export const getLibrarianStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await reportService.getLibrarianStats();

  res.json({
    success: true,
    data: stats,
  });
});

export const getLibraryStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await reportService.getLibraryStats();

  res.json({
    success: true,
    data: stats,
  });
});

export const exportMostBorrowedBooks = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
  const filepath = await reportService.exportMostBorrowedBooksToCSV(limit);

  res.download(filepath, 'most_borrowed_books.csv', err => {
    if (err) {
      console.error('Error downloading file:', err);
    }
    // Clean up temp file
    fs.unlinkSync(filepath);
  });
});

export const exportOverdueBooks = asyncHandler(async (req: Request, res: Response) => {
  const filepath = await reportService.exportOverdueBooksToCSV();

  res.download(filepath, 'overdue_books.csv', err => {
    if (err) {
      console.error('Error downloading file:', err);
    }
    // Clean up temp file
    fs.unlinkSync(filepath);
  });
});

export const exportLibrarianActivity = asyncHandler(async (req: Request, res: Response) => {
  const startDate = req.query.start_date as string;
  const endDate = req.query.end_date as string;

  const filepath = await reportService.exportLibrarianActivityToCSV(startDate, endDate);

  res.download(filepath, 'librarian_activity.csv', err => {
    if (err) {
      console.error('Error downloading file:', err);
    }
    // Clean up temp file
    fs.unlinkSync(filepath);
  });
});
