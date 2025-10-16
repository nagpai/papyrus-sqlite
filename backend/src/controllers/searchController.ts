import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import searchService from '../services/searchService';

export const universalSearch = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query.q as string;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

  if (!query || query.trim().length === 0) {
    res.status(400).json({
      success: false,
      error: 'Search query is required',
    });
    return;
  }

  const results = await searchService.universalSearch(query, limit);

  res.json({
    success: true,
    data: results,
  });
});

export const searchBooks = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    query: req.query.q as string,
    genre: req.query.genre as string,
    author: req.query.author as string,
    available: req.query.available === 'true' ? true : req.query.available === 'false' ? false : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
  };

  const results = await searchService.searchBooks(filters);

  res.json({
    success: true,
    data: results,
  });
});

export const searchBorrowers = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    query: req.query.q as string,
    wing: req.query.wing as string,
    apartment: req.query.apartment as string,
    active: req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
  };

  const results = await searchService.searchBorrowers(filters);

  res.json({
    success: true,
    data: results,
  });
});
