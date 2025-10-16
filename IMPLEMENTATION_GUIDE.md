# Papyrus Library Management System - Implementation Guide

## Overview

This document provides a comprehensive guide to the Papyrus Library Management System implementation. The system has been scaffolded with a complete backend API, database schema, and a React-based desktop frontend.

## Project Structure

```
papyrus-sqlite/
├── backend/              # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── config/       # Database configuration and schema
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # Auth, audit, error handling
│   │   ├── models/       # (Future: ORM models if needed)
│   │   ├── routes/       # API route definitions
│   │   ├── services/     # Business logic
│   │   ├── types/        # TypeScript interfaces
│   │   └── utils/        # Helper functions
│   └── package.json
├── desktop/              # React + Vite frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── contexts/     # React contexts (Auth, etc.)
│   │   ├── pages/        # Page components
│   │   ├── services/     # API client
│   │   └── utils/        # Frontend utilities
│   └── package.json
├── mobile/               # (Future: React Native app)
├── shared/               # (Future: Shared types/utilities)
└── CLAUDE.md            # Project requirements
```

## Backend Implementation

### Completed Features

1. **Database Schema** ([backend/src/config/schema.sql](backend/src/config/schema.sql))
   - Books table with copy tracking
   - Borrowers table with apartment validation
   - Transactions table for borrowing/returning
   - Audit logs for all actions
   - Settings table for configuration
   - Proper indexes for performance

2. **Authentication System**
   - JWT-based authentication
   - Role-based access control (admin, librarian, assistant)
   - Password hashing with bcrypt
   - Token management middleware

3. **API Endpoints**
   - `/api/auth` - Login, profile, librarian management
   - `/api/books` - CRUD operations, search, genres
   - `/api/borrowers` - CRUD operations, history
   - `/api/transactions` - Borrow, return, overdue tracking
   - `/api/search` - Universal search across books and borrowers
   - `/api/reports` - Statistics and CSV exports

4. **Business Logic**
   - Apartment number validation (Wing A-D, Floors 1-27, Units 1-4)
   - 3-book borrowing limit per apartment
   - Automatic due date calculation
   - Fine calculation for overdue books
   - Audit trail logging for all actions

5. **Security Features**
   - Helmet for HTTP headers
   - Rate limiting
   - Input validation
   - SQL injection prevention via parameterized queries
   - CORS configuration

### Backend Environment Variables

Create a [backend/.env](backend/.env) file:

```env
PORT=3001
NODE_ENV=development
DB_PATH=./database/papyrus.db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
OVERDUE_FINE_PER_DAY=5
DUE_DATE_DAYS=14
MAX_BOOKS_PER_APARTMENT=3
```

### Running the Backend

```bash
cd backend
npm install
npm run dev  # Development mode with hot reload
npm run build  # Production build
npm start  # Run production build
```

Default admin credentials:
- Username: `admin`
- Password: `admin123`

**IMPORTANT:** Change this password immediately after first login!

## Frontend Implementation

### Completed Features

1. **Application Shell**
   - Responsive layout with sidebar navigation
   - Universal search bar
   - Authentication flow
   - Protected routes

2. **Pages (Scaffolded)**
   - Login page (fully functional)
   - Dashboard with statistics (functional)
   - Books list (functional)
   - Other pages (scaffolded, need implementation)

3. **API Integration**
   - Complete API client with all endpoints
   - Authentication context
   - React Query for data fetching
   - Toast notifications for feedback

4. **UI Framework**
   - Tailwind CSS for styling
   - Heroicons for icons
   - Headless UI for accessible components
   - React Hook Form for forms (to be implemented)

### Frontend Environment Variables

Create a [desktop/.env](desktop/.env) file:

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### Running the Frontend

```bash
cd desktop
npm install
npm run dev  # Development mode
npm run build  # Production build
```

Access the app at: `http://localhost:5173`

## Next Steps for Development

### Priority 1: Core Functionality

1. **Complete Book Management Pages**
   - [ ] Add/Edit book form with validation
   - [ ] Book detail page with borrowing history
   - [ ] Book deletion with confirmation
   - [ ] Multiple copy management

2. **Complete Borrower Management**
   - [ ] Add/Edit borrower form with apartment validation
   - [ ] Borrower detail page with borrowing history
   - [ ] Borrower status management (active/inactive)
   - [ ] View current borrowed books per borrower

3. **Complete Transaction Management**
   - [ ] Borrow book flow (select book + borrower)
   - [ ] Return book flow with fine calculation
   - [ ] Transaction history view
   - [ ] Overdue books management

### Priority 2: Advanced Features

4. **Search & Filters**
   - [ ] Advanced book search (by genre, author, ISBN)
   - [ ] Borrower search (by apartment, wing)
   - [ ] Filter by status (available, borrowed, overdue)

5. **Reporting & Analytics**
   - [ ] Most borrowed books report
   - [ ] Active borrowers report
   - [ ] Overdue books report
   - [ ] Librarian activity report
   - [ ] PDF export using jsPDF
   - [ ] CSV export (backend ready)

6. **Settings & Configuration**
   - [ ] Fine rate configuration
   - [ ] Due date period configuration
   - [ ] Library information settings
   - [ ] Change password functionality
   - [ ] Librarian account management (admin only)

### Priority 3: Additional Features

7. **Data Management**
   - [ ] Database backup functionality
   - [ ] Database restore functionality
   - [ ] Export/import data

8. **Notifications**
   - [ ] Email notifications for due dates
   - [ ] SMS notifications (Twilio integration)
   - [ ] In-app notification system
   - [ ] Scheduled notification jobs (using node-cron)

9. **Mobile App**
   - [ ] React Native setup
   - [ ] Mobile UI/UX design
   - [ ] API connection over local network
   - [ ] Core features (search, view, transactions)

10. **Desktop Packaging**
    - [ ] Electron wrapper
    - [ ] Windows installer
    - [ ] macOS installer
    - [ ] Linux packages

## Database Management

### Initial Setup

The database is automatically initialized on first run with:
- All required tables
- Indexes for performance
- Default settings
- Default admin account

### Migrations

For schema changes:
1. Create a new SQL file in `backend/src/config/migrations/`
2. Add migration logic to `initDatabase.ts`
3. Run migrations on startup

### Backup & Restore

The database file is located at `backend/database/papyrus.db` (or path specified in .env).

Manual backup:
```bash
cp backend/database/papyrus.db backend/database/backup_$(date +%Y%m%d_%H%M%S).db
```

## API Documentation

### Authentication

All API requests (except `/auth/login`) require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Common Response Format

Success:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

Error:
```json
{
  "error": "Error message",
  "status": "error"
}
```

### Key Endpoints

#### Books
- `GET /api/books` - List all books (with filters)
- `GET /api/books/:id` - Get book details
- `GET /api/books/:id/history` - Get book with borrowing history
- `POST /api/books` - Create new book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

#### Borrowers
- `GET /api/borrowers` - List all borrowers
- `GET /api/borrowers/:id` - Get borrower details
- `GET /api/borrowers/:id/history` - Get borrower with history
- `POST /api/borrowers` - Create new borrower
- `PUT /api/borrowers/:id` - Update borrower
- `DELETE /api/borrowers/:id` - Delete borrower

#### Transactions
- `POST /api/transactions/borrow` - Borrow a book
- `POST /api/transactions/return` - Return a book
- `GET /api/transactions` - List transactions
- `GET /api/transactions/overdue` - Get overdue transactions

#### Search
- `GET /api/search?q=query` - Universal search
- `GET /api/search/books?q=query` - Search books
- `GET /api/search/borrowers?q=query` - Search borrowers

#### Reports
- `GET /api/reports/library-stats` - Overall statistics
- `GET /api/reports/most-borrowed` - Most borrowed books
- `GET /api/reports/overdue` - Overdue books
- `GET /api/reports/export/overdue` - Download overdue CSV

## Development Workflow

### Adding a New Feature

1. **Backend**
   - Add types in `backend/src/types/index.ts`
   - Create service in `backend/src/services/`
   - Create controller in `backend/src/controllers/`
   - Add routes in `backend/src/routes/`
   - Add validation if needed

2. **Frontend**
   - Add API method in `desktop/src/services/api.ts`
   - Create page/component in `desktop/src/pages/` or `desktop/src/components/`
   - Add route in `desktop/src/App.tsx`
   - Implement UI with React Query for data fetching

### Testing

- Backend: Add tests in `backend/src/**/*.test.ts` (Jest configured)
- Frontend: Add component tests (to be configured)
- Manual testing via Postman or similar tools

## Deployment

### Development Deployment

Both backend and frontend can run simultaneously:
```bash
npm run dev  # From root directory (uses concurrently)
```

### Production Deployment

1. Build backend:
```bash
cd backend && npm run build
```

2. Build frontend:
```bash
cd desktop && npm run build
```

3. For desktop app, package with Electron:
```bash
# To be implemented
```

## Known Limitations & Future Improvements

1. **Current Limitations**
   - No email/SMS notifications implemented yet
   - Mobile app not started
   - Backup/restore UI not implemented
   - No PDF report generation yet
   - Some frontend pages are scaffolds

2. **Suggested Improvements**
   - Add comprehensive test coverage
   - Implement WebSocket for real-time updates
   - Add data export/import functionality
   - Create admin dashboard with analytics
   - Add book cover image support
   - Implement barcode scanning for books
   - Add QR code generation for borrower cards

## Support & Maintenance

### Common Issues

1. **Database locked error**: Close any other connections to the SQLite database
2. **CORS errors**: Check CORS configuration in backend
3. **JWT token expired**: User needs to login again

### Logging

- Backend logs to console (can be configured to file)
- Frontend errors shown via toast notifications
- Audit logs stored in database

## License

MIT License - See LICENSE file for details
