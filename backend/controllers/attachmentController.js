const pool = require("../config/db");
const { createNotification, notifyTicketUsers  } = require("./notificationController");


const uploadAttachment = async (req, res) => {
  try {
    const io = req.app.get("io");
    const file = req.file;
    const ticketId = Number(req.body.ticketId);
    const userId = req.user.userId;
    const ticket = await pool.query(
      `
      SELECT "TicketNumber", "CreatedByUserId"
      FROM ticket
      WHERE "ID" = $1
      `,
      [ticketId]
    );
    if (!ticket.rows.length) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = `/uploads/${file.filename}`;

    await pool.query(
      `
      INSERT INTO attachment
      ("TicketId", "UploadedByUserID", "FilePath", "FileType", "FileSize", "CreatedAt")
      VALUES ($1, $2, $3, $4, $5, NOW())
      `,
      [
        ticketId,
        userId,
        filePath,
        file.mimetype,
        file.size
      ]
    );
    
    const userRes = await pool.query(
      `SELECT "FullName" FROM "user" WHERE "ID" = $1`,
      [userId]
    );

    const userName = userRes.rows[0].FullName;
    if (ticket.rows[0].CreatedByUserId !== userId) {
      await createNotification(req, {
        userId: ticket.rows[0].CreatedByUserId,
        title: "New Attachment",
        message: ` ${userName} uploaded New file to Ticket ${ticket.rows[0].TicketNumber}`,
        type: "attachment"
      });
    }

    
    await notifyTicketUsers(req, ticketId, userId, {
      title: "New Attachment",
      message: ` ${userName} added file to Ticket ${ticket.rows[0].TicketNumber}`,
      type: "attachment"
    });

    res.json({ message: "File uploaded successfully" });

  } catch (err) {
    console.log("UPLOAD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
module.exports = { uploadAttachment };