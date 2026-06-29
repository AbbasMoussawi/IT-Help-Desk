const pool = require("../config/db");

const getEmployeeRecentTickets = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `
      SELECT
        t."ID",
        t."TicketNumber",
        t."Title",
        t."CreatedAt",
        s."StatusName"

      FROM ticket t

      LEFT JOIN status s
      ON t."StatusId" = s."ID"

      WHERE t."CreatedByUserId" = $1
      AND t."IsActive" = TRUE

      ORDER BY t."CreatedAt" DESC
      LIMIT 5
      `,
      [userId]
    );

    res.json(result.rows);

  } catch (err) {
    console.log("DASHBOARD ERROR:", err);

    res.status(500).json({
      message: err.message
    });
  }
};

const getAssignedTickets = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `
      SELECT
        t."ID",
        t."TicketNumber",
        t."Title",
        t."CreatedAt",
        s."StatusName",
        p."PriorityName"

      FROM ticket t

      LEFT JOIN status s
      ON t."StatusId" = s."ID"

      LEFT JOIN priority p
      ON t."PriorityId" = p."ID"

      WHERE t."AssignedToUserId" = $1
      AND t."IsActive" = TRUE

      ORDER BY t."CreatedAt" DESC
      LIMIT 5
      `,
      [userId]
    );

    res.json(result.rows);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message
    });
  }
};

const getUrgentTickets = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    let query = `
      SELECT
        t."ID",
        t."TicketNumber",
        t."Title",
        t."CreatedAt",
        p."PriorityName",
        s."StatusName"
      FROM ticket t
      LEFT JOIN priority p ON t."PriorityId" = p."ID"
      LEFT JOIN status s ON t."StatusId" = s."ID"
      WHERE p."PriorityName" = 'High'
      AND t."IsActive" = TRUE
    `;

    const values = [];

    if (role === "IT Support") {
      query += ` AND t."AssignedToUserId" = $1`;
      values.push(userId);
    }

    query += ` ORDER BY t."CreatedAt" DESC LIMIT 5`;

    const result = await pool.query(query, values);

    res.json(result.rows);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};
const getDashboardCounters = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    let result;

    if (role === "Employee") {
      result = await pool.query(
        `
        SELECT
          COUNT(*) FILTER (WHERE "IsActive" = TRUE) AS "totalTickets",
          COUNT(*) FILTER (WHERE s."StatusName" = 'Open') AS "openTickets",
          COUNT(*) FILTER (WHERE s."StatusName"='In Progress') AS "progressTickets",
          COUNT(*) FILTER (WHERE s."StatusName" = 'Resolved') AS "resolvedTickets"

        FROM ticket t
        LEFT JOIN status s ON t."StatusId" = s."ID"
        WHERE t."CreatedByUserId" = $1
        AND t."IsActive" = TRUE
        
        `,
        [userId]
      );
    }
    else if (role === "IT Support") {
      result = await pool.query(
        `
        SELECT
          COUNT(*) FILTER (
            WHERE t."AssignedToUserId" = $1
            AND t."IsActive" = TRUE
          ) AS "totalTickets",

          COUNT(*) FILTER (
            WHERE t."AssignedToUserId" = $1
            AND s."StatusName" = 'Open'
            AND t."IsActive" = TRUE
          ) AS "openTickets",

          COUNT(*) FILTER (
            WHERE t."AssignedToUserId" = $1
            AND s."StatusName" = 'In Progress'
            AND t."IsActive" = TRUE
          ) AS "progressTickets",

          COUNT(*) FILTER (
            WHERE t."AssignedToUserId" = $1
            AND s."StatusName" = 'Resolved'
            AND t."IsActive" = TRUE
          ) AS "resolvedTickets"

        FROM ticket t
        LEFT JOIN status s
          ON t."StatusId" = s."ID"
        `,
        [userId]
      );
    }
    else if (role === "Manager") {
      result = await pool.query(
        `
        SELECT
          COUNT(*) FILTER (
            WHERE t."IsActive" = TRUE
          ) AS "totalTickets",

          COUNT(*) FILTER (
            WHERE s."StatusName"='Open'
            AND t."IsActive" = TRUE
          ) AS "openTickets",

          COUNT(*) FILTER (
            WHERE s."StatusName"='In Progress'
            AND t."IsActive" = TRUE
          ) AS "progressTickets",

          COUNT(*) FILTER (
            WHERE s."StatusName"='Resolved'
            AND t."IsActive" = TRUE
          ) AS "resolvedTickets"

        FROM ticket t
        LEFT JOIN status s
          ON t."StatusId"=s."ID"
        `
      );
    }
    else if (role === "Admin") {
      result = await pool.query(
        `
        SELECT

          (
            SELECT COUNT(*)
            FROM "user"
            WHERE "IsActive" = TRUE
          ) AS "totalUsers",

          (
            SELECT COUNT(*)
            FROM ticket
            WHERE "IsActive"=TRUE
          ) AS "totalTickets",

          (
            SELECT COUNT(*)
            FROM ticket t
            LEFT JOIN status s
            ON t."StatusId"=s."ID"
            WHERE s."StatusName"='Open'
            AND t."IsActive" = TRUE
          ) AS "openTickets",

          (
            SELECT COUNT(*)
            FROM ticket t
            LEFT JOIN status s
            ON t."StatusId"=s."ID"
            WHERE s."StatusName"='In Progress'
            AND t."IsActive" = TRUE
          ) AS "progressTickets",

          (
            SELECT COUNT(*)
            FROM ticket t
            LEFT JOIN status s
            ON t."StatusId"=s."ID"
            WHERE s."StatusName"='Resolved'
            AND t."IsActive" = TRUE
          ) AS "resolvedTickets"
        `
      );
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};
const getActivity = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    const { mode, period, type } = req.query;

    let values = [];
    let conditions = [];

    

    if (role === "Employee") {
      conditions.push(`t."CreatedByUserId" = $1`);
      values.push(userId);
    }

    else if (role === "IT Support") {
      conditions.push(`t."AssignedToUserId" = $1`);
      values.push(userId);
    }

 

    if (period === "today") {
      conditions.push(`DATE(ta."CreatedAt") = CURRENT_DATE`);
    }

    else if (period === "7days") {
      conditions.push(
        `ta."CreatedAt" >= NOW() - INTERVAL '7 days'`
      );
    }

    else if (period === "30days") {
      conditions.push(
        `ta."CreatedAt" >= NOW() - INTERVAL '30 days'`
      );
    }

    if (type && type !== "all") {
      conditions.push(`ta."Action" = '${type}'`);
    }

    let limitClause = "";

    if (mode === "dashboard") {
      limitClause = `LIMIT 5`;
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const query = `
      SELECT
        ta."ID",
        ta."Action",
        ta."NewValue",
        ta."OldValue",
        ta."CreatedAt",
        t."TicketNumber",
        u."FullName" AS "UserName"

      FROM ticket_activity ta

      LEFT JOIN ticket t
      ON ta."TicketId" = t."ID"
      LEFT JOIN "user" u
      ON ta."UserId" = u."ID"

      ${whereClause}

      ORDER BY ta."CreatedAt" DESC

      ${limitClause}
    `;

    const result = await pool.query(query, values);

    res.json(result.rows);

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message,
    });
  }
};

const getUnassignedTickets = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        t."ID",
        t."TicketNumber",
        t."Title",
        t."CreatedAt"
      FROM ticket t
      WHERE t."AssignedToUserId" IS NULL AND t."IsActive" = TRUE
      ORDER BY t."CreatedAt" DESC
      LIMIT 5
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getHighPriorityTickets = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        t."ID",
        t."TicketNumber",
        t."Title",
        t."CreatedAt",
        p."PriorityName",
        s."StatusName"
      FROM ticket t
      LEFT JOIN priority p ON t."PriorityId" = p."ID"
      LEFT JOIN status s ON t."StatusId" = s."ID"
      WHERE p."PriorityName" = 'High'
        AND t."IsActive" = TRUE
        AND t."AssignedToUserId" IS NOT NULL
      ORDER BY t."CreatedAt" DESC
      LIMIT 5
    `);

    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

const getTeamPerformance = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u."ID",
        u."FullName",
        COUNT(t."ID") AS "ResolvedCount"
      FROM "user" u
      LEFT JOIN ticket t
        ON t."AssignedToUserId" = u."ID"
      LEFT JOIN status s
        ON t."StatusId" = s."ID"
      WHERE s."StatusName" = 'Resolved'
      AND t."IsActive" = TRUE
      AND u."IsActive" = TRUE
      GROUP BY u."ID", u."FullName"
      ORDER BY "ResolvedCount" DESC
      LIMIT 5
    `);

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getUserOverview = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        r."RoleName" AS role,
        COUNT(u."ID") AS count
      FROM "user" u
      JOIN role r ON u."RoleId" = r."ID"
      WHERE u."IsActive" = TRUE
      GROUP BY r."RoleName"
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getTicketCategories = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c."CategoryName" AS "Category",
        COUNT(t."ID") AS "Count"
      FROM category c
      LEFT JOIN ticket t
        ON t."CategoryId" = c."ID"
        AND t."IsActive" = TRUE
      GROUP BY c."CategoryName"
      ORDER BY c."CategoryName"
    `);

    res.json(result.rows);
  } catch (err) {
    console.log("CATEGORY ERROR:", err);
    res.status(500).json({
      message: err.message,
    });
  }
};

const getRecentNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `
      SELECT
        n."ID",
        n."Title",
        n."Message",
        n."CreatedAt",
        n."Type",
        n."IsRead",
        t."TicketNumber",
        u."FullName"
      FROM notification n
      LEFT JOIN ticket t ON n."Message" LIKE '%' || t."TicketNumber" || '%'
      LEFT JOIN "user" u ON n."UserId" = u."ID"
      WHERE n."UserId" = $1
         OR n."UserId" IS NULL
      ORDER BY n."CreatedAt" DESC
      LIMIT 4
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getEmployeeRecentTickets,
  getAssignedTickets,
  getUrgentTickets,
  getDashboardCounters,
  getActivity,
  getUnassignedTickets,
  getHighPriorityTickets,
  getTeamPerformance,
  getUserOverview,
  getTicketCategories,
  getRecentNotifications
};