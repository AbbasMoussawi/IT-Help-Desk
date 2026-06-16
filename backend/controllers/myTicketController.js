const pool = require("../config/db");

const getMyTickets = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `
      SELECT
        t."ID",
        t."TicketNumber",
        t."Title",
        t."Description",

        t."CreatedAt",
        t."UpdatedAt",

        s."StatusName",
        p."PriorityName",
        c."CategoryName",

        creator."FullName" AS "CreatedByName",
        it."FullName" AS "ITName",

        COALESCE(a."AttachmentCount", 0) AS "AttachmentCount"

      FROM ticket t

      LEFT JOIN status s ON t."StatusId" = s."ID"
      LEFT JOIN priority p ON t."PriorityId" = p."ID"
      LEFT JOIN category c ON t."CategoryId" = c."ID"

      LEFT JOIN "user" creator ON t."CreatedByUserId" = creator."ID"
      LEFT JOIN "user" it ON t."AssignedToUserId" = it."ID"

      LEFT JOIN (
        SELECT "TicketId", COUNT(*) AS "AttachmentCount"
        FROM attachment
        GROUP BY "TicketId"
      ) a ON a."TicketId" = t."ID"

      WHERE t."CreatedByUserId" = $1
      AND t."IsActive" = true

      ORDER BY t."CreatedAt" DESC
      `,
      [userId]
    );

    res.json({
      tickets: result.rows,
    });

  } catch (err) {
    console.log("GET MY TICKETS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getMyTickets };