# Papyrus Library Management System - Quick Start Guide

Welcome to Papyrus! This guide will help you get the system up and running quickly.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

## Quick Start (5 minutes)

### Step 1: Install Dependencies

From the project root directory:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install desktop dependencies
cd ../desktop
npm install

# Return to root
cd ..
```

### Step 2: Set Up Environment Variables

#### Backend Environment

Create `backend/.env` file:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your preferred settings (or use defaults):
```env
PORT=3001
NODE_ENV=development
DB_PATH=./database/papyrus.db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

#### Desktop Environment

Create `desktop/.env` file:

```bash
cd ../desktop
cp .env.example .env
```

The default settings should work:
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### Step 3: Start the Application

From the root directory:

```bash
npm run dev
```

This will start both the backend API and the frontend development server concurrently.

You should see:
- Backend running at: `http://localhost:3001`
- Frontend running at: `http://localhost:5173`

### Step 4: Login

Open your browser and go to: `http://localhost:5173`

Use the default admin credentials:
- **Username:** `admin`
- **Password:** `admin123`

**IMPORTANT:** Change this password immediately after first login for security!

## What's Working Now

### ✅ Fully Functional Features

1. **Backend API** (100% complete)
   - All API endpoints working
   - Database automatically initialized
   - Authentication and authorization
   - Audit logging
   - Business logic (3-book limit, overdue tracking, etc.)

2. **Login & Authentication**
   - JWT-based authentication
   - Protected routes
   - User session management

3. **Dashboard**
   - Library statistics
   - Overdue books alert
   - Quick action links

4. **Books List**
   - View all books
   - Basic table display
   - Status indicators (available/borrowed)

5. **Search**
   - Universal search bar (functional backend)
   - Search across books and borrowers

### 🚧 Partially Complete (Needs UI Work)

The following features have complete backend APIs but need frontend pages built:

1. **Book Management**
   - Backend: ✅ Complete
   - Frontend: 🚧 List view done, add/edit/detail pages needed

2. **Borrower Management**
   - Backend: ✅ Complete
   - Frontend: 🚧 Scaffolded, needs implementation

3. **Transaction Management**
   - Backend: ✅ Complete
   - Frontend: 🚧 Scaffolded, needs borrow/return forms

4. **Reports**
   - Backend: ✅ Complete (with CSV export)
   - Frontend: 🚧 Scaffolded, needs charts and export UI

5. **Settings**
   - Backend: ✅ Complete
   - Frontend: 🚧 Scaffolded, needs settings forms

## Testing the API

You can test the API directly using tools like:
- **curl**
- **Postman**
- **Thunder Client** (VS Code extension)
- **Insomnia**

### Example API Calls

#### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

#### Get Books (with auth token)
```bash
curl -X GET http://localhost:3001/api/books \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Create a Book
```bash
curl -X POST http://localhost:3001/api/books \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "9780743273565",
    "genre": "Classic",
    "publication_date": "1925-04-10"
  }'
```

## Project Structure Overview

```
papyrus-sqlite/
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── config/       # DB schema and initialization
│   │   ├── controllers/  # Route handlers
│   │   ├── services/     # Business logic
│   │   ├── routes/       # API routes
│   │   └── middleware/   # Auth, audit, error handling
│   └── database/         # SQLite database (auto-created)
│
├── desktop/              # React frontend
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── services/     # API client
│   │   └── contexts/     # React contexts
│   └── public/
│
└── mobile/               # React Native (future)
```

## Next Development Steps

To continue building the application, refer to [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for:

### Immediate Priorities

1. **Complete Book Management UI**
   - Add/edit book forms
   - Book detail page with history
   - Book deletion with confirmation

2. **Complete Borrower Management UI**
   - Add/edit borrower forms with apartment validation
   - Borrower detail page with borrowing history

3. **Complete Transaction UI**
   - Borrow book flow (select book + borrower)
   - Return book flow with fine calculation
   - Transaction history view

### After Core Features

4. Add reporting with charts and PDF export
5. Implement settings and configuration UI
6. Add backup/restore functionality
7. Build notification system
8. Create mobile app with React Native
9. Package as Electron desktop app

## Common Commands

### Development

```bash
# Run both backend and frontend
npm run dev

# Run backend only
npm run dev:backend

# Run frontend only
npm run dev:desktop
```

### Building

```bash
# Build everything
npm run build

# Build backend
npm run build:backend

# Build frontend
npm run build:desktop
```

### Other

```bash
# Run tests (when implemented)
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Troubleshooting

### Port Already in Use

If you see "Port 3001 is already in use":
```bash
# Find and kill the process using the port (macOS/Linux)
lsof -ti:3001 | xargs kill -9

# Or change the port in backend/.env
PORT=3002
```

### Database Errors

If you encounter database errors, try deleting and recreating:
```bash
rm backend/database/papyrus.db
# Restart the backend - it will recreate automatically
```

### Authentication Issues

If you can't login:
1. Check that backend is running on port 3001
2. Check browser console for errors
3. Verify credentials: admin/admin123
4. Clear localStorage and try again

### Frontend Not Loading

1. Check that Vite dev server is running
2. Open browser console for errors
3. Verify API_BASE_URL in desktop/.env
4. Try `cd desktop && npm install` again

## Getting Help

- Check [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for detailed documentation
- Check [CLAUDE.md](CLAUDE.md) for project requirements
- Review API endpoints in backend route files
- Check browser/server console for errors

## Database Information

### Default Admin Account

- Username: `admin`
- Password: `admin123`
- Role: `admin`

**Security Note:** This is a default password meant for initial setup only. Please change it immediately after first login through the Settings page.

### Database Location

The SQLite database file is stored at:
- Path: `backend/database/papyrus.db`
- This is created automatically on first run
- You can back it up by copying this file

### Sample Data

The system starts with minimal data (just the admin account). To test the system:

1. Add some books through the API or UI
2. Add some borrowers
3. Create transactions (borrow/return books)
4. View reports and statistics

## Security Considerations

For production deployment:

1. ✅ Change the default admin password
2. ✅ Use a strong JWT_SECRET
3. ✅ Enable HTTPS
4. ✅ Set up proper firewall rules
5. ✅ Regular database backups
6. ✅ Keep dependencies updated
7. ✅ Review and restrict API access

## What's Next?

Now that you have the system running, you can:

1. **Explore the Dashboard** - View library statistics and quick actions
2. **Browse Books** - See the books list (currently empty, add some!)
3. **Test the API** - Use Postman to interact with all endpoints
4. **Build Features** - Follow the implementation guide to complete the UI
5. **Customize** - Adjust settings to match your library's needs

Happy coding! 📚
