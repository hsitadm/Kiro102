# On-Call Rotation Calendar

A modern web application designed to generate and manage interactive schedules for operations teams distributed across multiple time zones. The system ensures equitable distribution of on-call shifts while respecting work-hour constraints, time zone advantages, and personal circumstances.

## Features

- Shift management with work-hour constraints and rest periods
- Time zone optimization for shift assignments
- Special circumstances handling (birthdays, holidays, vacations, sick leave)
- Team composition management
- Schedule generation and balancing
- Calendar publication and integration with Google Calendar and Jira
- AI-assisted schedule adjustments
- Modern, interactive user interface
- Statistics and analytics on shift distribution
- Collaborator availability management
- Historical data management
- Collaborator access to view assigned shifts

## Project Structure

```
on-call-rotation-calendar/
├── backend/               # Node.js Express backend
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Custom middleware
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   ├── .env               # Environment variables
│   └── package.json       # Backend dependencies
├── frontend/              # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── assets/        # Images, fonts, etc.
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service calls
│   │   └── utils/         # Utility functions
│   └── package.json       # Frontend dependencies
└── docs/                  # Documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

### Configuration

1. Create a `.env` file in the backend directory based on the `.env.example` template
2. Configure your MongoDB connection string and other environment variables

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```
2. Start the frontend development server:
   ```
   cd frontend
   npm start
   ```
3. Access the application at `http://localhost:3000`

## Development

### Backend API Documentation

API documentation is available at `/api-docs` when running the backend server.

### Testing

Run backend tests:
```
cd backend
npm test
```

Run frontend tests:
```
cd frontend
npm test
```

## Deployment

Instructions for deploying the application to production environments will be added in future updates.

## License

This project is licensed under the ISC License.