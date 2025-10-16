# Papyrus - Library Management System

A comprehensive desktop and mobile library management system designed for apartment block libraries.

## Features

- Book cataloging with multiple copies support
- Borrower management tied to apartment units
- Librarian accounts with audit trails
- Book borrowing and return tracking
- Overdue warnings and fine calculations
- Universal search across books and borrowers
- Comprehensive reporting (PDF, CSV exports)
- Data backup and restore
- Email and SMS notifications
- Mobile app for remote access

## Technology Stack

- **Frontend**: React.js (Desktop), React Native (Mobile)
- **Backend**: Node.js with Express.js
- **Database**: SQLite
- **Authentication**: JWT
- **Desktop Packaging**: Electron

## Project Structure

```
papyrus-sqlite/
├── backend/          # Express.js API server
├── desktop/          # React desktop application
├── mobile/           # React Native mobile app
├── shared/           # Shared utilities and types
└── CLAUDE.md         # Project requirements
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- For mobile development: Expo CLI

### Installation

```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev
```

### Development

```bash
# Run backend only
npm run dev:backend

# Run desktop app only
npm run dev:desktop

# Run both concurrently
npm run dev
```

### Building

```bash
# Build all projects
npm run build

# Build individually
npm run build:backend
npm run build:desktop
```

## Configuration

The system is configured to work with apartment blocks having:
- 4 wings (A, B, C, D)
- 27 floors per wing
- 4 apartments per floor
- Apartment format: [Wing][Floor][Unit] (e.g., A101, B2503)

## License

MIT
