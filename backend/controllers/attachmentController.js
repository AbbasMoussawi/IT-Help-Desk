const pool = require("../config/db");

const uploadAttachment = async (req, res) => {
  try {
    const file = req.file;
    const ticketId = Number(req.body.ticketId);
    const userId = req.user.userId;

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

    res.json({ message: "File uploaded successfully" });

  } catch (err) {
    console.log("UPLOAD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
module.exports = { uploadAttachment };