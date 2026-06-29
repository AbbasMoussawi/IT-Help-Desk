const pool = require("../config/db");

const notifyTicketUsers = async (req, ticketId, actorId, payload) => {
    console.log("4 - notify ..");
  const io = req.app.get("io");

  const result = await pool.query(`
    SELECT DISTINCT "ID"
    FROM "user"
    WHERE
        "ID" IN (
        SELECT "CreatedByUserId" FROM ticket WHERE "ID" = $1
        UNION
        SELECT "AssignedToUserId" FROM ticket WHERE "ID" = $1
        )
        OR "RoleId" IN (1,4)
    `, [ticketId]);
  console.log("5 - users:", result.rows);

  for (const user of result.rows) {
    console.log("6 - user loop:", user);
    
    if (Number(user.ID) === Number(actorId)) continue;
    console.log("7 - inserting notification");
    const notification = await pool.query(`
      INSERT INTO notification
      ("UserId","Title","Message","Type","CreatedAt","IsRead")
      VALUES ($1,$2,$3,$4,NOW(),false)
      RETURNING *
    `, [
      user.ID,
      payload.title,
      payload.message,
      payload.type
    ]);
    console.log("7 - inserted");

    io.to(`user_${user.ID}`).emit("newNotification", notification.rows[0]);
  }
  
};
const createNotification = async (req, { userId, title, message, type }) => {
  const io = req.app.get("io");

  const result = await pool.query(
    `
    INSERT INTO notification
    ("UserId","Title","Message","Type","CreatedAt","IsRead")
    VALUES ($1,$2,$3,$4,NOW(),false)
    RETURNING *
    `,
    [userId, title, message, type]
  );

  const notification = result.rows[0];

  io.to(`user_${userId}`).emit("newNotification", notification);

  return notification;
};
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `
      SELECT *
      FROM notification
      WHERE "UserId" = $1
      ORDER BY "CreatedAt" DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `
      SELECT COUNT(*)::int
      FROM notification
      WHERE "UserId" = $1 AND "IsRead" = false
      `,
      [userId]
    );

    res.json({ count: result.rows[0].count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `
      UPDATE notification
      SET "IsRead" = true
      WHERE "ID" = $1
      `,
      [id]
    );

    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    await pool.query(
      `
      UPDATE notification
      SET "IsRead" = true
      WHERE "UserId" = $1 AND "IsRead" = false
      `,
      [userId]
    );

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  notifyTicketUsers   
};