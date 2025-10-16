import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import bookService from '../services/bookService';
import { CreateBookDTO, UpdateBookDTO } from '../types';

export const createBook = asyncHandler(async (req: Request, res: Response) => {
  const data: CreateBookDTO = req.body;
  const createdBy = req.user!.id;
  const book = await bookService.createBook(data, createdBy);

  res.status(201).json({
    success: true,
    message: 'Book created successfully',
    data: book,
  });
});

export const updateBook = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const data: UpdateBookDTO = req.body;
  const updatedBy = req.user!.id;
  const book = await bookService.updateBook(id, data, updatedBy);

  res.json({
    success: true,
    message: 'Book updated successfully',
    data: book,
  });
});

export const deleteBook = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const deletedBy = req.user!.id;
  await bookService.deleteBook(id, deletedBy);

  res.json({
    success: true,
    message: 'Book deleted successfully',
  });
});

export const getBook = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const book = await bookService.getBookById(id);

  res.json({
    success: true,
    data: book,
  });
});

export const getBookWithHistory = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const data = await bookService.getBookWithHistory(id);

  res.json({
    success: true,
    data,
  });
});

export const getAllBooks = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    search: req.query.search as string,
    genre: req.query.genre as string,
    author: req.query.author as string,
    available: req.query.available === 'true' ? true : req.query.available === 'false' ? false : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
    offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
  };

  const result = await bookService.getAllBooks(filters);

  res.json({
    success: true,
    data: result.books,
    pagination: {
      total: result.total,
      limit: filters.limit,
      offset: filters.offset,
    },
  });
});

export const getMostBorrowedBooks = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
  const books = await bookService.getMostBorrowedBooks(limit);

  res.json({
    success: true,
    data: books,
  });
});

export const getGenres = asyncHandler(async (req: Request, res: Response) => {
  const genres = await bookService.getGenres();

  res.json({
    success: true,
    data: genres,
  });
});
