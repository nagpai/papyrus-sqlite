import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import borrowerService from '../services/borrowerService';
import { CreateBorrowerDTO, UpdateBorrowerDTO } from '../types';

export const createBorrower = asyncHandler(async (req: Request, res: Response) => {
  const data: CreateBorrowerDTO = req.body;
  const createdBy = req.user!.id;
  const borrower = await borrowerService.createBorrower(data, createdBy);

  res.status(201).json({
    success: true,
    message: 'Borrower created successfully',
    data: borrower,
  });
});

export const updateBorrower = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const data: UpdateBorrowerDTO = req.body;
  const updatedBy = req.user!.id;
  const borrower = await borrowerService.updateBorrower(id, data, updatedBy);

  res.json({
    success: true,
    message: 'Borrower updated successfully',
    data: borrower,
  });
});

export const deleteBorrower = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const deletedBy = req.user!.id;
  await borrowerService.deleteBorrower(id, deletedBy);

  res.json({
    success: true,
    message: 'Borrower deleted successfully',
  });
});

export const getBorrower = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const borrower = await borrowerService.getBorrowerById(id);

  res.json({
    success: true,
    data: borrower,
  });
});

export const getBorrowerWithHistory = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const data = await borrowerService.getBorrowerWithHistory(id);

  res.json({
    success: true,
    data,
  });
});

export const getAllBorrowers = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    search: req.query.search as string,
    wing: req.query.wing as string,
    apartment_number: req.query.apartment_number as string,
    active: req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
    offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
  };

  const result = await borrowerService.getAllBorrowers(filters);

  res.json({
    success: true,
    data: result.borrowers,
    pagination: {
      total: result.total,
      limit: filters.limit,
      offset: filters.offset,
    },
  });
});

export const getActiveBorrowers = asyncHandler(async (req: Request, res: Response) => {
  const borrowers = await borrowerService.getActiveBorrowers();

  res.json({
    success: true,
    data: borrowers,
  });
});
