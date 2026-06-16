const pool = require("../config/db");

const getMyTickets = async (req, res) => {
  try {
    const userId = Number(req.user.userId);

    const result = await pool.query(
      `
      SELECT 
        t."ID",
        t."TicketNumber",
        t."Title",
        t."Description",
        t."CreatedAt",
        t."CreatedByUserId",
        t."AssignedToUserId",

        creator."FullName" AS "CreatedByName",
        assignee."FullName" AS "AssignedToName",

        s."StatusName",
        p."PriorityName",
        c."CategoryName",

        COALESCE(
          json_agg(
            json_build_object(
              'ID', a."ID",
              'FilePath', a."FilePath",
              'FileType', a."FileType",
              'FileSize', a."FileSize",
              'CreatedAt', a."CreatedAt"
            )
            ORDER BY a."CreatedAt" DESC
          ) FILTER (WHERE a."ID" IS NOT NULL),
          '[]'::json
        ) AS "Attachments"

      FROM ticket t
      

      LEFT JOIN status s ON t."StatusId" = s."ID"
      LEFT JOIN priority p ON t."PriorityId" = p."ID"
      LEFT JOIN category c ON t."CategoryId" = c."ID"

      LEFT JOIN "user" creator ON t."CreatedByUserId" = creator."ID"
      LEFT JOIN "user" assignee ON t."AssignedToUserId" = assignee."ID"

      LEFT JOIN attachment a ON t."ID" = a."TicketId"

      WHERE
      (
          t."CreatedByUserId" = $1
          OR t."AssignedToUserId" = $1
      )
      AND t."IsActive" = true

      GROUP BY 
        t."ID",
        creator."FullName",
        assignee."FullName",
        s."StatusName",
        p."PriorityName",
        c."CategoryName"

      ORDER BY t."CreatedAt" DESC
      `,
      [userId]
    );

    const rows = result.rows;

    const created = rows.filter(
      (t) => Number(t.CreatedByUserId) === userId
    );

    const assigned = rows.filter(
      (t) => Number(t.AssignedToUserId) === userId
    );

    return res.json({
      created,
      assigned,
    });

  } catch (error) {
    console.log("GET MY TICKETS ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

const getFilters = async (req, res) => {
  try {
    const categories = await pool.query(`
      SELECT "ID", "CategoryName"
      FROM category
      ORDER BY "CategoryName"
    `);

    const statuses = await pool.query(`
      SELECT "ID", "StatusName"
      FROM status
      ORDER BY "ID"
    `);

    const priorities = await pool.query(`
      SELECT "ID", "PriorityName"
      FROM priority
      ORDER BY "ID"
    `);

    return res.json({
      categories: categories.rows,
      statuses: statuses.rows,
      priorities: priorities.rows,
    });

  } catch (err) {
    console.log("FILTER ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};



const getSidebarCounts = async (req, res) => {
  try {
    const userId = Number(req.user.userId);

    const result = await pool.query(`
      SELECT 

        COUNT(*) FILTER (
          WHERE s."StatusName" = 'Open'
          AND (t."AssignedToUserId" = $1 OR t."CreatedByUserId" = $1)
        )::int AS open,

        COUNT(*) FILTER (
          WHERE s."StatusName" = 'In Progress'
          AND (t."AssignedToUserId" = $1 OR t."CreatedByUserId" = $1)
        )::int AS in_progress,

        COUNT(*) FILTER (
          WHERE s."StatusName" = 'Resolved'
          AND (t."AssignedToUserId" = $1 OR t."CreatedByUserId" = $1)
        )::int AS resolved,

        COUNT(*) FILTER (
          WHERE s."StatusName" = 'Closed'
          AND (t."AssignedToUserId" = $1 OR t."CreatedByUserId" = $1)
        )::int AS closed,

        COUNT(*) FILTER (
          WHERE t."AssignedToUserId" = $1
        )::int AS assigned

      FROM ticket t
      JOIN status s ON t."StatusId" = s."ID"
      WHERE t."IsActive" = true
    `, [userId]);

    return res.json(result.rows[0]);

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};


module.exports = {
  getMyTickets,
  getFilters,
  getSidebarCounts
};