# Papyrus API Reference

Quick reference guide for all API endpoints.

**Base URL**: `http://localhost:3001/api`

**Authentication**: All endpoints (except `/auth/login`) require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication

### POST `/auth/login`
Login and get JWT token.

**Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "librarian": {
      "id": 1,
      "username": "admin",
      "full_name": "System Administrator",
      "role": "admin"
    }
  }
}
```

### GET `/auth/profile`
Get current user profile.

### PUT `/auth/change-password`
Change password.

**Body:**
```json
{
  "oldPassword": "admin123",
  "newPassword": "newSecurePassword"
}
```

### GET `/auth/librarians` (Admin only)
List all librarians.

### POST `/auth/librarians` (Admin only)
Create new librarian account.

**Body:**
```json
{
  "username": "librarian1",
  "password": "password123",
  "full_name": "John Doe",
  "email": "john@example.com",
  "role": "librarian"
}
```

---

## 📚 Books

### GET `/books`
List all books with optional filters.

**Query Parameters:**
- `search` - Search in title, author, ISBN
- `genre` - Filter by genre
- `author` - Filter by author
- `available` - Filter by availability (true/false)
- `limit` - Results per page (default: 50)
- `offset` - Pagination offset (default: 0)

**Example:**
```
GET /books?search=gatsby&available=true&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "isbn": "9780743273565",
      "genre": "Classic",
      "is_available": true,
      "total_times_borrowed": 5
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 20,
    "offset": 0
  }
}
```

### GET `/books/:id`
Get book details.

### GET `/books/:id/history`
Get book with full borrowing history and audit logs.

**Response:**
```json
{
  "success": true,
  "data": {
    "book": { ... },
    "borrowHistory": [ ... ],
    "auditLogs": [ ... ]
  }
}
```

### POST `/books`
Create new book.

**Body:**
```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "9780743273565",
  "genre": "Classic",
  "publication_date": "1925-04-10",
  "publisher": "Scribner",
  "description": "A classic novel...",
  "copy_number": 1
}
```

### PUT `/books/:id`
Update book.

**Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "is_available": false
}
```

### DELETE `/books/:id`
Delete book (fails if currently borrowed).

### GET `/books/genres`
Get list of all genres.

**Response:**
```json
{
  "success": true,
  "data": ["Classic", "Fiction", "Non-Fiction", "Mystery"]
}
```

### GET `/books/most-borrowed`
Get most borrowed books.

**Query Parameters:**
- `limit` - Number of results (default: 10)

---

## 👥 Borrowers

### GET `/borrowers`
List all borrowers with optional filters.

**Query Parameters:**
- `search` - Search in name, apartment, phone
- `wing` - Filter by wing (A, B, C, D)
- `apartment_number` - Filter by apartment
- `active` - Filter by status (true/false)
- `limit` - Results per page (default: 50)
- `offset` - Pagination offset (default: 0)

### GET `/borrowers/:id`
Get borrower details.

### GET `/borrowers/:id/history`
Get borrower with full borrowing history and audit logs.

**Response:**
```json
{
  "success": true,
  "data": {
    "borrower": { ... },
    "borrowHistory": [ ... ],
    "currentBorrows": [ ... ],
    "auditLogs": [ ... ]
  }
}
```

### POST `/borrowers`
Create new borrower.

**Body:**
```json
{
  "full_name": "John Doe",
  "apartment_number": "A0101",
  "phone": "1234567890",
  "email": "john@example.com",
  "notes": "Prefers fiction"
}
```

**Apartment Format:**
- Wing: A-D
- Floor: 01-27 (2 digits)
- Unit: 01-04 (2 digits)
- Example: A0101, B2503, D2704

### PUT `/borrowers/:id`
Update borrower.

**Body:** (all fields optional)
```json
{
  "full_name": "John Smith",
  "phone": "9876543210",
  "is_active": false,
  "exit_date": "2025-12-31"
}
```

### DELETE `/borrowers/:id`
Delete borrower (fails if has active loans).

### GET `/borrowers/active`
Get borrowers with active loans.

---

## 🔄 Transactions

### GET `/transactions`
List all transactions.

**Query Parameters:**
- `status` - Filter by status (borrowed, returned, overdue)
- `borrower_id` - Filter by borrower
- `book_id` - Filter by book
- `limit` - Results per page (default: 50)
- `offset` - Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "book_id": 1,
      "borrower_id": 1,
      "book_title": "The Great Gatsby",
      "borrower_name": "John Doe",
      "apartment_number": "A0101",
      "borrow_date": "2025-10-01",
      "due_date": "2025-10-15",
      "status": "borrowed",
      "fine_amount": 0
    }
  ]
}
```

### POST `/transactions/borrow`
Borrow a book.

**Body:**
```json
{
  "book_id": 1,
  "borrower_id": 1,
  "notes": "Requested by email"
}
```

**Validations:**
- Book must be available
- Borrower must be active
- Apartment must not exceed 3-book limit
- Auto-calculates due date based on settings

### POST `/transactions/return`
Return a book.

**Body:**
```json
{
  "transaction_id": 1,
  "fine_paid": true,
  "notes": "Book in good condition"
}
```

**Automatically:**
- Calculates fine if overdue
- Marks book as available
- Sets return date

### GET `/transactions/:id`
Get transaction details.

### GET `/transactions/overdue`
Get all overdue transactions.

**Response includes:**
- Days overdue
- Calculated fine amount
- Borrower contact information

### PUT `/transactions/update-overdue`
Batch update all overdue statuses.

### GET `/transactions/stats`
Get transaction statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalBorrowed": 150,
    "totalReturned": 120,
    "totalOverdue": 5,
    "activeBorrows": 25
  }
}
```

---

## 🔍 Search

### GET `/search`
Universal search across books and borrowers.

**Query Parameters:**
- `q` - Search query (required)
- `limit` - Results per category (default: 20)

**Example:**
```
GET /search?q=gatsby
```

**Response:**
```json
{
  "success": true,
  "data": {
    "books": [
      {
        "id": 1,
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "type": "book"
      }
    ],
    "borrowers": []
  }
}
```

### GET `/search/books`
Search books only.

**Query Parameters:**
- `q` - Search query
- `genre` - Filter by genre
- `author` - Filter by author
- `available` - Filter by availability
- `limit` - Results limit

### GET `/search/borrowers`
Search borrowers only.

**Query Parameters:**
- `q` - Search query
- `wing` - Filter by wing
- `apartment` - Filter by apartment
- `active` - Filter by status
- `limit` - Results limit

---

## 📊 Reports

### GET `/reports/library-stats`
Get overall library statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalBooks": 250,
    "availableBooks": 200,
    "borrowedBooks": 50,
    "totalBorrowers": 100,
    "activeBorrowers": 30,
    "overdueBooks": 5,
    "totalTransactions": 500
  }
}
```

### GET `/reports/most-borrowed`
Get most borrowed books.

**Query Parameters:**
- `limit` - Number of results (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "borrow_count": 25,
      "total_times_borrowed": 25
    }
  ]
}
```

### GET `/reports/active-borrowers`
Get borrowers with active loans.

### GET `/reports/overdue`
Get detailed overdue books report.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "The Great Gatsby",
      "borrower_name": "John Doe",
      "apartment_number": "A0101",
      "phone": "1234567890",
      "due_date": "2025-10-01",
      "days_overdue": 15
    }
  ]
}
```

### GET `/reports/librarian-activity`
Get librarian activity audit log.

**Query Parameters:**
- `start_date` - Filter from date (YYYY-MM-DD)
- `end_date` - Filter to date (YYYY-MM-DD)

### GET `/reports/librarian-stats`
Get statistics per librarian.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "full_name": "Admin User",
      "role": "admin",
      "borrows_processed": 50,
      "returns_processed": 45,
      "books_added": 10,
      "borrowers_registered": 5,
      "total_actions": 110
    }
  ]
}
```

---

## 📥 Exports (CSV)

These endpoints return CSV files for download.

### GET `/reports/export/most-borrowed`
Download most borrowed books as CSV.

**Query Parameters:**
- `limit` - Number of results (default: 10)

**Response:** CSV file download

### GET `/reports/export/overdue`
Download overdue books as CSV.

**Response:** CSV file download

### GET `/reports/export/librarian-activity`
Download librarian activity as CSV.

**Query Parameters:**
- `start_date` - Filter from date
- `end_date` - Filter to date

**Response:** CSV file download

---

## 🔧 Health Check

### GET `/health`
Check if server is running.

**No authentication required.**

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-16T10:00:00.000Z",
  "uptime": 3600
}
```

---

## 🚨 Error Responses

All error responses follow this format:

```json
{
  "error": "Error message description",
  "status": "error"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 📝 Notes

### Pagination
Most list endpoints support pagination:
```
GET /books?limit=20&offset=40
```

### Date Formats
- Dates are in ISO 8601 format: `YYYY-MM-DD`
- Timestamps: `YYYY-MM-DDTHH:mm:ss.sssZ`

### Filters
Multiple filters can be combined:
```
GET /books?genre=Fiction&available=true&search=harry
```

### Settings
Default configuration (stored in database):
- `overdue_fine_per_day`: 5
- `due_date_days`: 14
- `max_books_per_apartment`: 3

These can be modified via the settings API (to be implemented in frontend).

---

## 🧪 Testing with curl

### Login and save token:
```bash
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.data.token')
```

### Use token in subsequent requests:
```bash
curl -X GET http://localhost:3001/api/books \
  -H "Authorization: Bearer $TOKEN"
```

### Create a book:
```bash
curl -X POST http://localhost:3001/api/books \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "1984",
    "author": "George Orwell",
    "genre": "Dystopian"
  }'
```

---

For detailed implementation examples, see [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md).
