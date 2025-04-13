# Roxiler-Systems-Assignment

# Store Rating System

A full-stack web application for managing store ratings with different user roles.

## Features

- User authentication and authorization
- Role-based access control (Admin, Normal User, Store Owner)
- Store management and rating system
- Dashboard for different user types
- Advanced filtering and sorting capabilities

## Tech Stack

- Frontend: React.js
- Backend: Express.js
- Database: SQL
- Styling: CSS

## Project Structure

```
store-rating-system/
├── frontend/           # React frontend
├── backend/           # Express backend
└── database/          # SQL database scripts
```

## Getting Started

### Prerequisites

- Node.js
- npm
- SQL database (MySQL/PostgreSQL)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   cd ../backend
   npm install
   ```
3. Set up the database
4. Configure environment variables
5. Start the development servers:
   ```bash
   # Frontend
   cd frontend
   npm start
   
   # Backend
   cd backend
   npm start
   ```

## User Roles

1. System Administrator
   - Full system access
   - User and store management
   - Dashboard with statistics

2. Normal User
   - View and rate stores
   - Update profile
   - Search functionality

3. Store Owner
   - View store ratings
   - Access to rating analytics
   - Profile management 
