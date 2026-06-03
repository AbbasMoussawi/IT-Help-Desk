const bcrypt = require("bcrypt");
const pool = require("../config/db");

async function createTestUsers() {
  try {
    const password = "123456";
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
    `
      INSERT INTO "user"
      ("FullName", "Email", "PasswordHash", "RoleId", "IsActive")
      VALUES
      ('Abbas', 'abbas.mswi.143@gmail.com', $1, 1, true)
      `,
      [hashedPassword]
    );

    console.log("Test users created successfully");
    console.log("Password for all test users: 123456");

    process.exit();
  } catch (error) {
    console.error("Error creating test users:", error);
    process.exit(1);
  }
}

createTestUsers();