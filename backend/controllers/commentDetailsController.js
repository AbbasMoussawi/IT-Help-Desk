const pool = require("../config/db");
const { createNotification } = require("./notificationController");
const { notifyTicketUsers } = require("./notificationController");

const addComment = async (req, res) => {
  try {
    console.log("1 - add comment");
    const io = req.app.get("io");
    const { ticketId, commentText, isInternal } = req.body;

    const userId = req.user.userId;

    const ticket = await pool.query(`
      SELECT "TicketNumber", "CreatedByUserId"
      FROM ticket
      WHERE "ID" = $1
    `, [ticketId]);
      console.log("2 - ticket:", ticket.rows);
    if (!ticket.rows.length) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const result = await pool.query(`
      INSERT INTO comment
      ("TicketId","UserId","CommentText","IsInternal","CreatedAt")
      VALUES ($1,$2,$3,$4,NOW())
      RETURNING *
    `, [ticketId, userId, commentText, isInternal && req.user.role !== "Employee"]);

    const userRes = await pool.query(`
      SELECT "FullName" FROM "user" WHERE "ID" = $1
    `, [userId]);

    const userName = userRes.rows[0].FullName;
      console.log("3 - before notify");
    await notifyTicketUsers(req, ticketId, userId, {
      title: "New Comment",
      message: `${userName} commented on Ticket ${ticket.rows[0].TicketNumber}`,
      type: "comment"
    });

    res.json({
      ...result.rows[0],
      FullName: userName,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const getComments = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const role = req.user.role;

    let query = `
      SELECT c.*, u."FullName"
      FROM comment c
      JOIN "user" u ON c."UserId" = u."ID"
      WHERE c."TicketId" = $1
    `;

    const values = [ticketId];

    
    if (role === "Employee") {
      query += ` AND c."IsInternal" = FALSE `;
    }

    query += ` ORDER BY c."CreatedAt" ASC`;

    const result = await pool.query(query, values);

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



module.exports = { addComment, getComments };