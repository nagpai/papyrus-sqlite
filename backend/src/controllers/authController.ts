import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import authService from '../services/authService';
import { LoginDTO, CreateLibrarianDTO, UpdateLibrarianDTO } from '../types';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const loginData: LoginDTO = req.body;
  const result = await authService.login(loginData);

  res.json({
    success: true,
    message: 'Login successful',
    data: result,
  });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const librarian = await authService.getLibrarianById(userId);

  res.json({
    success: true,
    data: librarian,
  });
});

export const createLibrarian = asyncHandler(async (req: Request, res: Response) => {
  const data: CreateLibrarianDTO = req.body;
  const createdBy = req.user!.id;
  const librarian = await authService.createLibrarian(data, createdBy);

  res.status(201).json({
    success: true,
    message: 'Librarian created successfully',
    data: librarian,
  });
});

export const updateLibrarian = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const data: UpdateLibrarianDTO = req.body;
  const librarian = await authService.updateLibrarian(id, data);

  res.json({
    success: true,
    message: 'Librarian updated successfully',
    data: librarian,
  });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { oldPassword, newPassword } = req.body;

  await authService.changePassword(userId, oldPassword, newPassword);

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

export const getAllLibrarians = asyncHandler(async (req: Request, res: Response) => {
  const librarians = await authService.getAllLibrarians();

  res.json({
    success: true,
    data: librarians,
  });
});
