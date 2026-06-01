========================================
        IT HELP DESK PROJECT
========================================

Full Stack Project (React + Node.js + PostgreSQL)

========================================
1. BACKEND SETUP
========================================

Node modules needed:

npm install express pg bcrypt jsonwebtoken cors dotenv
npm install --save-dev nodemon

----------------------------------------

Modify package.json scripts:

"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}

----------------------------------------

To run backend:

npm run dev

Backend runs on:
http://localhost:5050

========================================
2. BACKEND STRUCTURE
========================================

backend/
├── config/
│   └── db.js
├── controllers/
│   └── authController.js
├── middleware/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
├── routes/
│   ├── authRoutes.js
│   └── testRoutes.js
├── scripts/
│   └── createTestUsers.js
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── server.js

========================================
3. ENVIRONMENT VARIABLES (.env)
========================================

PORT=5050

DB_HOST=localhost
DB_PORT=5432
DB_NAME=it_help_desk
DB_USER=postgres
DB_PASSWORD=your_postgres_password

JWT_SECRET=change_this_secret_key_later
JWT_EXPIRES_IN=1d

========================================
4. DATABASE
========================================

Database name:
it_help_desk

Tables:

- Role
- User

(See SQL schema inside backend files)

Seed data inserted:
- Admin
- Manager
- IT Support Agent
- Employee


========================================
5. FRONTEND OVERVIEW (REACT)
========================================

Frontend uses React with functional components.

Main features:
- Login system
- Dashboard with role-based UI
- Protected routes
- Local storage authentication

----------------------------------------

LOGIN COMPONENT:

- Uses useState for email/password
- Validates input fields
- Sends API request to backend:

POST http://localhost:5050/api/auth/login

- Stores response in localStorage:
  - token
  - role
  - name

Icons used:
- FaEnvelope (email icon)
- FaLock (password icon)

Library:
react-icons

----------------------------------------

DASHBOARD COMPONENT:

- Uses useEffect to load data from localStorage
- Displays message based on user role:

Roles:
- Admin → Admin Dashboard
- IT → IT Dashboard
- Employee → Employee Dashboard

Shows:
- Welcome message
- User name

----------------------------------------

PROTECTED ROUTE:

- Checks if token exists in localStorage
- If not found → redirects to login page

Logic:
IF no token → Navigate("/")
ELSE allow access

========================================
6. FRONTEND FLOW
========================================

Login Page → API Call → Save Token → Redirect →
Dashboard → Role Check → Show UI

========================================
7. PROJECT SUMMARY
========================================

This is a full-stack authentication system:

Backend:
- Node.js + Express
- PostgreSQL database
- JWT authentication
- Role-based access

Frontend:
- React
- Login system
- Protected routes
- Role-based dashboard UI



========================================
 HOW TO RUN THE PROJECT
========================================

1. DATABASE
- Create PostgreSQL database: it_help_desk
- Run database.sql file

----------------------------------------

2. BACKEND
cd backend
npm install
npm run dev

Backend runs on:
http://localhost:5050

----------------------------------------

3. FRONTEND
cd frontend
npm install
npm start

Frontend runs on:
http://localhost:3000

========================================
END OF FILE
========================================