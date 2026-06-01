Node modules needed : 
npm install express pg bcrypt jsonwebtoken cors dotenv
npm install --save-dev nodemon

inside package.json modify scripts to:
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}

to run the backend in terminal type: npm run dev

backend structure should be like this : 
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

create .env file inside the backend folder 
PORT=5050

DB_HOST=localhost
DB_PORT=5432
DB_NAME=it_help_desk
DB_USER=postgres
DB_PASSWORD=your_postgres_password

JWT_SECRET=change_this_secret_key_later
JWT_EXPIRES_IN=1d

Replace your_postgres_password with your PostgreSQL password. 
 
create .gitignore file inside the backend folder and type : 
node_modules
.env


data base name : it_help_desk


tables created inside it : 
CREATE TABLE "Role" (
    "Id" SERIAL PRIMARY KEY,
    "RoleName" VARCHAR(100) NOT NULL UNIQUE,
    "CreatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Department" (
    "Id" SERIAL PRIMARY KEY,
    "DepartmentName" VARCHAR(100) NOT NULL UNIQUE,
    "CreatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "User" (
    "Id" SERIAL PRIMARY KEY,
    "FullName" VARCHAR(150) NOT NULL,
    "Email" VARCHAR(150) NOT NULL UNIQUE,
    "PasswordHash" TEXT NOT NULL,
    "RoleId" INT NOT NULL,
    "DepartmentId" INT,
    "IsActive" BOOLEAN DEFAULT TRUE,
    "CreatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "UpdatedDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FkUser_RoleId"
        FOREIGN KEY ("RoleId") REFERENCES "Role"("Id"),

    CONSTRAINT "FkUser_DepartmentId"
        FOREIGN KEY ("DepartmentId") REFERENCES "Department"("Id")
);


inserted role and Department : 

INSERT INTO "Role" ("RoleName")
VALUES 
('Admin'),
('Manager'),
('IT Support Agent'),
('Employee')
ON CONFLICT ("RoleName") DO NOTHING;

INSERT INTO "Department" ("DepartmentName")
VALUES
('IT'),
('HR'),
('Finance'),
('Sales')
ON CONFLICT ("DepartmentName") DO NOTHING;