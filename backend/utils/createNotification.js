const pool = require("../config/db");

const createNotification = async ({ userId, title, message, type }) => {
  await pool.query(
    `
    INSERT INTO notification
    ("UserId","Title","Message","Type","CreatedAt")
    VALUES ($1,$2,$3,$4,NOW())
    `,
    [userId, title, message, type]
  );
};

module.exports = createNotification;