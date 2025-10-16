# Papyrus Library Management - TODO Checklist

This file tracks the remaining development tasks for the Papyrus system.

## 🎯 PRIORITY 1: Core UI Functionality

### Books Management UI
- [ ] Create AddBookModal component
  - [ ] Form with validation (title, author, ISBN, genre, etc.)
  - [ ] Genre dropdown from API
  - [ ] Copy number input
  - [ ] Success/error handling
- [ ] Create EditBookModal component
  - [ ] Pre-fill form with existing data
  - [ ] Update book via API
- [ ] Build BookDetailPage
  - [ ] Display book information
  - [ ] Show borrowing history table
  - [ ] Show audit logs
  - [ ] Edit and delete buttons
- [ ] Add book filters to BooksPage
  - [ ] Search by title/author/ISBN
  - [ ] Filter by genre
  - [ ] Filter by availability
- [ ] Implement delete confirmation modal

### Borrowers Management UI
- [ ] Build BorrowersPage list view
  - [ ] Table with borrower information
  - [ ] Show apartment number and wing
  - [ ] Show active/inactive status
  - [ ] Search and filter functionality
- [ ] Create AddBorrowerModal component
  - [ ] Form with apartment validation
  - [ ] Real-time apartment format validation
  - [ ] Wing/Floor/Unit inputs
  - [ ] Phone and email fields
- [ ] Create EditBorrowerModal component
  - [ ] Pre-fill form with existing data
  - [ ] Update borrower via API
- [ ] Build BorrowerDetailPage
  - [ ] Display borrower information
  - [ ] Show current borrowed books
  - [ ] Show borrowing history
  - [ ] Show audit logs
  - [ ] Edit and delete buttons
- [ ] Add borrower filters
  - [ ] Search by name/apartment/phone
  - [ ] Filter by wing
  - [ ] Filter by active status
- [ ] Implement delete confirmation modal

### Transactions Management UI
- [ ] Build TransactionsPage
  - [ ] List all transactions
  - [ ] Filter by status (borrowed, returned, overdue)
  - [ ] Show borrower and book information
  - [ ] Show due dates and fine amounts
- [ ] Create BorrowBookModal component
  - [ ] Search and select book
  - [ ] Search and select borrower
  - [ ] Check 3-book apartment limit
  - [ ] Show calculated due date
  - [ ] Notes field
  - [ ] Submit borrow transaction
- [ ] Create ReturnBookModal component
  - [ ] Search for active transaction
  - [ ] Show book and borrower details
  - [ ] Calculate and display fine (if overdue)
  - [ ] Fine paid checkbox
  - [ ] Notes field
  - [ ] Submit return transaction
- [ ] Add quick action buttons
  - [ ] Borrow book button
  - [ ] Return book button
- [ ] Implement overdue highlighting
  - [ ] Red background for overdue items
  - [ ] Show days overdue
  - [ ] Show calculated fine

## 🎯 PRIORITY 2: Reports & Analytics

### Reports Page
- [ ] Build ReportsPage layout
  - [ ] Tab navigation for different report types
  - [ ] Date range filters
- [ ] Most Borrowed Books Report
  - [ ] Table or chart showing top borrowed books
  - [ ] Borrow count display
  - [ ] Export to CSV button
  - [ ] Export to PDF button
- [ ] Active Borrowers Report
  - [ ] List borrowers with active loans
  - [ ] Show books they currently have
  - [ ] Export functionality
- [ ] Overdue Books Report
  - [ ] Table with overdue details
  - [ ] Days overdue calculation
  - [ ] Fine amount display
  - [ ] Export functionality
- [ ] Librarian Activity Report
  - [ ] Date range selector
  - [ ] Activity timeline/chart
  - [ ] Action type filters
  - [ ] Export functionality
- [ ] Library Statistics Dashboard
  - [ ] Charts for book distribution
  - [ ] Borrowing trends over time
  - [ ] Popular genres
  - [ ] Wing-wise statistics
- [ ] Implement PDF export
  - [ ] Install and configure jsPDF
  - [ ] Create PDF templates
  - [ ] Generate PDFs for each report type

## 🎯 PRIORITY 3: Settings & Configuration

### Settings Page
- [ ] Build SettingsPage with tabs
  - [ ] Library Information tab
  - [ ] Configuration tab
  - [ ] Librarian Management tab
  - [ ] Backup & Restore tab
  - [ ] Profile tab
- [ ] Library Information Form
  - [ ] Library name
  - [ ] Address
  - [ ] Contact phone and email
  - [ ] Save to settings API
- [ ] Configuration Form
  - [ ] Overdue fine per day
  - [ ] Due date period (days)
  - [ ] Max books per apartment
  - [ ] Notification settings
  - [ ] Save to settings API
- [ ] Librarian Management (Admin only)
  - [ ] List all librarians
  - [ ] Add new librarian form
  - [ ] Edit librarian (role, active status)
  - [ ] Disable/enable librarian accounts
  - [ ] Cannot delete own account
- [ ] Profile & Password Change
  - [ ] Display current user info
  - [ ] Change password form
  - [ ] Validate old password
  - [ ] Password strength indicator
- [ ] Backup & Restore
  - [ ] Manual backup button
  - [ ] Download backup file
  - [ ] Restore from backup
  - [ ] Auto-backup configuration
  - [ ] List available backups

## 🎯 PRIORITY 4: Enhanced Features

### Search & Filters
- [ ] Improve universal search
  - [ ] Show search results in modal
  - [ ] Category tabs (books/borrowers)
  - [ ] Quick navigation to results
  - [ ] Recent searches
- [ ] Add advanced search pages
  - [ ] Advanced book search with multiple criteria
  - [ ] Advanced borrower search
  - [ ] Save search filters

### UI/UX Improvements
- [ ] Add loading skeletons
  - [ ] Replace "Loading..." with skeleton screens
  - [ ] Table skeletons
  - [ ] Card skeletons
- [ ] Improve error states
  - [ ] Empty state illustrations
  - [ ] Error state illustrations
  - [ ] Retry buttons
- [ ] Add confirmation dialogs
  - [ ] Delete confirmations
  - [ ] Logout confirmation
  - [ ] Form abandon warnings
- [ ] Implement pagination
  - [ ] Table pagination component
  - [ ] Page size selector
  - [ ] Total count display
- [ ] Add sorting
  - [ ] Sortable table columns
  - [ ] Sort direction indicators
  - [ ] Multi-column sorting
- [ ] Improve accessibility
  - [ ] ARIA labels
  - [ ] Keyboard navigation
  - [ ] Focus management
  - [ ] Screen reader support

### Data Validation
- [ ] Add form validation with react-hook-form
  - [ ] Required field validation
  - [ ] Format validation (ISBN, phone, email)
  - [ ] Custom apartment number validator
  - [ ] Show inline error messages
- [ ] Add client-side validation
  - [ ] Real-time validation feedback
  - [ ] Async validation (check duplicates)

## 🚀 PRIORITY 5: Advanced Features

### Notifications System
- [ ] Backend notification service
  - [ ] Email service setup (nodemailer)
  - [ ] SMS service setup (Twilio)
  - [ ] Notification templates
  - [ ] Due date reminder job (node-cron)
  - [ ] Overdue notification job
- [ ] Frontend notification preferences
  - [ ] Enable/disable notifications
  - [ ] Email template preview
  - [ ] Test notification button

### Backup & Restore Implementation
- [ ] Backend backup service
  - [ ] Create backup endpoint
  - [ ] List backups endpoint
  - [ ] Restore from backup endpoint
  - [ ] Scheduled backup job
  - [ ] Backup compression
- [ ] Frontend backup UI
  - [ ] Backup now button
  - [ ] Backup list with dates
  - [ ] Download backup
  - [ ] Restore backup with confirmation

### Book Cover Images
- [ ] Add image upload
  - [ ] File upload component
  - [ ] Image preview
  - [ ] Image storage (filesystem or cloud)
  - [ ] Resize and optimize images
- [ ] Display book covers
  - [ ] In book list (thumbnails)
  - [ ] In book detail (full size)
  - [ ] Placeholder for missing covers

## 📱 PRIORITY 6: Mobile Application

### React Native Setup
- [ ] Initialize React Native project
  - [ ] Expo or React Native CLI
  - [ ] Project structure
  - [ ] Navigation setup (React Navigation)
- [ ] Shared types/utilities
  - [ ] Move types to shared package
  - [ ] Shared API client
  - [ ] Shared utilities

### Mobile UI
- [ ] Login screen
- [ ] Dashboard screen
- [ ] Books list and detail
- [ ] Borrowers list and detail
- [ ] Search functionality
- [ ] Transaction management
- [ ] Settings screen

### Mobile-Specific Features
- [ ] Local network discovery
  - [ ] Auto-detect backend server
  - [ ] Manual server configuration
- [ ] Offline mode
  - [ ] Cache data locally
  - [ ] Sync when online
- [ ] Camera features
  - [ ] Scan book barcodes
  - [ ] Scan borrower QR codes

## 🖥️ PRIORITY 7: Desktop Packaging

### Electron Integration
- [ ] Set up Electron
  - [ ] Install Electron
  - [ ] Main process setup
  - [ ] Renderer process integration
  - [ ] IPC communication
- [ ] Bundle backend with frontend
  - [ ] Package Node.js backend
  - [ ] Auto-start backend on launch
  - [ ] Backend lifecycle management

### Installers
- [ ] Windows installer
  - [ ] electron-builder configuration
  - [ ] NSIS installer
  - [ ] Auto-updater
- [ ] macOS installer
  - [ ] DMG creation
  - [ ] Code signing
  - [ ] Notarization
- [ ] Linux packages
  - [ ] AppImage
  - [ ] .deb package
  - [ ] .rpm package

## 🧪 PRIORITY 8: Testing

### Backend Tests
- [ ] Unit tests for services
  - [ ] authService tests
  - [ ] bookService tests
  - [ ] borrowerService tests
  - [ ] transactionService tests
- [ ] Integration tests for API endpoints
  - [ ] Auth endpoints
  - [ ] CRUD endpoints
  - [ ] Search endpoints
  - [ ] Report endpoints
- [ ] Test utilities
  - [ ] Test database setup/teardown
  - [ ] Mock data generators
  - [ ] Helper functions

### Frontend Tests
- [ ] Component tests
  - [ ] Button, Input, Modal tests
  - [ ] Form component tests
  - [ ] Page component tests
- [ ] Integration tests
  - [ ] User flow tests
  - [ ] API integration tests
- [ ] E2E tests
  - [ ] Login flow
  - [ ] Borrow/return flow
  - [ ] CRUD operations

## 📚 PRIORITY 9: Documentation

### API Documentation
- [ ] Set up Swagger/OpenAPI
  - [ ] Install swagger-jsdoc
  - [ ] Add JSDoc comments to routes
  - [ ] Generate OpenAPI spec
  - [ ] Swagger UI endpoint

### User Documentation
- [ ] User manual
  - [ ] Getting started guide
  - [ ] Feature walkthroughs
  - [ ] Screenshots
  - [ ] FAQ section
- [ ] Admin guide
  - [ ] Setup and configuration
  - [ ] User management
  - [ ] Backup and restore
  - [ ] Troubleshooting

### Developer Documentation
- [ ] Architecture documentation
  - [ ] System architecture diagram
  - [ ] Database schema diagram
  - [ ] API flow diagrams
- [ ] Code documentation
  - [ ] Inline code comments
  - [ ] TypeDoc generation
  - [ ] Contributing guidelines

## 🔧 PRIORITY 10: DevOps & Deployment

### Docker Support
- [ ] Create Dockerfiles
  - [ ] Backend Dockerfile
  - [ ] Frontend Dockerfile
  - [ ] Multi-stage builds
- [ ] Docker Compose setup
  - [ ] Backend service
  - [ ] Frontend service
  - [ ] Volume mounts for database
- [ ] Docker Hub images
  - [ ] Automated builds
  - [ ] Version tagging

### CI/CD Pipeline
- [ ] GitHub Actions workflow
  - [ ] Run tests on push
  - [ ] Lint checking
  - [ ] Build verification
  - [ ] Auto-deploy on merge
- [ ] Release automation
  - [ ] Semantic versioning
  - [ ] Changelog generation
  - [ ] GitHub releases

### Monitoring & Logging
- [ ] Backend logging
  - [ ] Structured logging
  - [ ] Log rotation
  - [ ] Error tracking (Sentry)
- [ ] Performance monitoring
  - [ ] API response times
  - [ ] Database query performance
  - [ ] Frontend performance metrics

## 💡 BONUS Features (Nice to Have)

- [ ] Multi-language support (i18n)
- [ ] Dark mode
- [ ] Print library card functionality
- [ ] Generate book labels
- [ ] Bulk import books from CSV
- [ ] Bulk import borrowers from CSV
- [ ] Integration with ISBN databases
- [ ] Book recommendations
- [ ] Reading lists
- [ ] Book reservations
- [ ] Fine payment integration
- [ ] Receipt generation
- [ ] Calendar view for due dates
- [ ] Borrower reading statistics
- [ ] Gamification (reading badges)
- [ ] Social features (book reviews, ratings)

---

## 📊 Progress Tracking

**Completed**: Backend (100%), Frontend Shell (100%), Login (100%), Dashboard (80%)

**In Progress**: Books UI (30%), Borrowers UI (10%), Transactions UI (10%)

**Not Started**: Reports, Settings, Mobile, Desktop Packaging, Testing, Advanced Features

**Estimated Time to MVP**: 4-6 weeks (core UI completion)

**Estimated Time to Full Features**: 10-12 weeks

---

## 🎯 Next Steps

**Week 1**: Complete Books UI + Borrowers UI
**Week 2**: Complete Transactions UI
**Week 3**: Reports + Settings
**Week 4**: Testing + Bug fixes

Start with Priority 1 tasks and work your way down!
