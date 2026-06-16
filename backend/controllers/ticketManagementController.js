const pool = require("../config/db");

const getAllTickets = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        t."ID",
        t."TicketNumber",
        t."Title",
        t."Description",
        t."CreatedAt",

        s."StatusName",
        p."PriorityName",
        c."CategoryName",

        creator."FullName" AS "CreatedByName",
        creator_role."RoleName" AS "CreatedByRole",

        assignee."FullName" AS "AssignedToName",
        assignee_role."RoleName" AS "AssignedToRole"

        FROM ticket t 

        LEFT JOIN status s
        ON t."StatusId" = s."ID"

        LEFT JOIN priority p
        ON t."PriorityId" = p."ID"

        LEFT JOIN category c
        ON t."CategoryId" = c."ID"

        LEFT JOIN "user" creator
        ON t."CreatedByUserId" = creator."ID"

        LEFT JOIN role creator_role
        ON creator."RoleId" = creator_role."ID"

        LEFT JOIN "user" assignee
        ON t."AssignedToUserId" = assignee."ID"

        LEFT JOIN role assignee_role
        ON assignee."RoleId" = assignee_role."ID"
        WHERE t."IsActive" = TRUE
        ORDER BY t."CreatedAt" DESC
    `);

    res.json({
      tickets: result.rows,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message,
    });
  }
};
const getTicketFilters = async (req, res) => {
  try {
    const categories = await pool.query(`
      SELECT "ID", "CategoryName"
      FROM category
      ORDER BY "CategoryName"
    `);

    const priorities = await pool.query(`
      SELECT "ID", "PriorityName"
      FROM priority
      ORDER BY "ID"
    `);

    const statuses = await pool.query(`
      SELECT "ID", "StatusName"
      FROM status
      ORDER BY "ID"
    `);

    res.json({
      categories: categories.rows,
      priorities: priorities.rows,
      statuses: statuses.rows
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.user.role;

    if (role !== "admin") {
      return res.status(403).json({ message: "Not allowed" });
    }
    await pool.query(
      `
      UPDATE ticket
      SET "IsActive" = FALSE
      WHERE "ID" = $1
      `,
      [id]
    );

    res.json({
      message: "Ticket deleted successfully",
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  getAllTickets,
  getTicketFilters,
  deleteTicket,
};