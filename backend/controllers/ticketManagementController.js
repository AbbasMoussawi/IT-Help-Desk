const pool = require("../config/db");
const { createNotification, notifyTicketUsers } = require("./notificationController");
const getAllTickets = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        t."ID",
        t."TicketNumber",
        t."Title",
        t."Description",
        t."CreatedAt",
        t."AssignedToUserId",

        s."StatusName",
        p."PriorityName",
        c."CategoryName",
        creator."ID" AS "CreatedByUserId",
        creator."FullName" AS "CreatedByName",
        creator_role."RoleName" AS "CreatedByRole",
        creator."Image" AS "CreatedByImage",
        assignee."ID" AS "AssignedToUserId",
        assignee."FullName" AS "AssignedToName",
        assignee_role."RoleName" AS "AssignedToRole",
        assignee."Image" AS "AssignedToImage"

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

    if (role !== "Admin") {
      return res.status(403).json({ message: "Not allowed" });
    }

    const ticketRes = await pool.query(
      `
      SELECT "TicketNumber", "CreatedByUserId"
      FROM ticket
      WHERE "ID" = $1
      `,
      [id]
    );

    if(ticketRes.rows.length === 0){
      return res.status(404).json({
        message:"Ticket not found"
      });
    }


    await pool.query(
      `
      UPDATE ticket
      SET "IsActive" = FALSE
      WHERE "ID" = $1
      `,
      [id]
    );


    const userRes = await pool.query(
      `SELECT "FullName" FROM "user" WHERE "ID" = $1`,
      [req.user.userId]
    );


    const userName = userRes.rows[0]?.FullName || "Admin";


    await notifyTicketUsers(req, id, req.user.userId, {
      title: "Ticket Deleted",
      message: `${userName} deleted ticket ${ticketRes.rows[0].TicketNumber}`,
      type: "warning"
    });


    res.json({
      message:"Ticket deleted successfully"
    });


  } catch(err){
    console.log(err);
    res.status(500).json({
      message:err.message
    });
  }
};

module.exports = {
  getAllTickets,
  getTicketFilters,
  deleteTicket,
};