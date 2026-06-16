const pool = require("../config/db");


const addComment = async (req, res) => {
  try {
    const { ticketId, commentText, isInternal } = req.body;
    const userId = req.user.userId;
    const role = req.user.role;


    const finalIsInternal = isInternal && role !== "Employee";

    const result = await pool.query(
      `
      INSERT INTO comment
      ("TicketId","UserId","CommentText","IsInternal","CreatedAt")
      VALUES ($1,$2,$3,$4,NOW())
      RETURNING *
      `,
      [ticketId, userId, commentText, finalIsInternal]
    );

    const userResult = await pool.query(
      `SELECT "FullName" FROM "user" WHERE "ID" = $1`,
      [userId]
    );

    res.json({
      ...result.rows[0],
      FullName: userResult.rows[0].FullName,
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