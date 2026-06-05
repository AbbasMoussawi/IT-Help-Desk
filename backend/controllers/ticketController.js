const pool = require("../config/db");

const createTicket = async (req, res) => {
  try {
    const { title, description, categoryId, priorityId } = req.body;

    if (!title || !description || !categoryId || !priorityId) {
      return res.status(400).json({
        message: "Title, description, category, and priority are required",
      });
    }

    const openStatusResult = await pool.query(
      `
      SELECT "ID"
      FROM "status"
      WHERE "StatusName" = 'Open'
      `
    );

    if (openStatusResult.rows.length === 0) {
      return res.status(500).json({
        message: "Open status does not exist in database",
      });
    }

    const openStatusId = openStatusResult.rows[0].ID;

    const ticketNumber = `TCK-${Date.now()}`;

    const result = await pool.query(
      `
      INSERT INTO "ticket"
      (
        "TicketNumber",
        "Title",
        "Description",
        "CreatedByUserId",
        "CategoryId",
        "PriorityId",
        "StatusId"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        ticketNumber,
        title,
        description,
        req.user.userId,
        categoryId,
        priorityId,
        openStatusId,
      ]
    );

    return res.status(201).json({
      message: "Ticket created successfully",
      ticket: result.rows[0],
    });
  } catch (error) {
    console.error("Create ticket error:", error);
    return res.status(500).json({
      message: "Server error while creating ticket",
    });
  }
};

const getTickets = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    let query = `
      SELECT
        t."ID",
        t."TicketNumber",
        t."Title",
        t."Description",
        t."CreatedByUserId",
        creator."FullName" AS "CreatedBy",
        t."AssignedToUserId",
        agent."FullName" AS "AssignedTo",
        c."CategoryName",
        p."PriorityName",
        s."StatusName",
        t."CreatedAt",
        t."UpdatedAt"
      FROM "ticket" t
      INNER JOIN "user" creator ON t."CreatedByUserId" = creator."ID"
      LEFT JOIN "user" agent ON t."AssignedToUserId" = agent."ID"
      INNER JOIN "category" c ON t."CategoryId" = c."ID"
      INNER JOIN "priority" p ON t."PriorityId" = p."ID"
      INNER JOIN "status" s ON t."StatusId" = s."ID"
    `;

    const values = [];

    if (role === "Employee") {
      query += ` WHERE t."CreatedByUserId" = $1`;
      values.push(userId);
    }

    if (role === "IT Support Agent") {
      query += ` WHERE t."AssignedToUserId" = $1`;
      values.push(userId);
    }

    query += ` ORDER BY t."CreatedAt" DESC`;

    const result = await pool.query(query, values);

    return res.status(200).json({
      tickets: result.rows,
    });
  } catch (error) {
    console.error("Get tickets error:", error);
    return res.status(500).json({
      message: "Server error while getting tickets",
    });
  }
};

const updateTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const {
      title,
      description,
      categoryId,
      priorityId,
      statusId,
      assignedToUserId,
    } = req.body;

    const ticketResult = await pool.query(
      `
      SELECT
        t."ID",
        t."CreatedByUserId",
        t."StatusId",
        s."StatusName"
      FROM "ticket" t
      INNER JOIN "status" s ON t."StatusId" = s."ID"
      WHERE t."ID" = $1
      `,
      [ticketId]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    const ticket = ticketResult.rows[0];

    if (
      ticket.StatusName === "In Progress" ||
      ticket.StatusName === "Resolved" ||
      ticket.StatusName === "Closed"
    ) {
      return res.status(400).json({
        message: "Ticket cannot be edited after it is in progress",
      });
    }

    const result = await pool.query(
      `
      UPDATE "ticket"
      SET
        "Title" = COALESCE($1, "Title"),
        "Description" = COALESCE($2, "Description"),
        "CategoryId" = COALESCE($3, "CategoryId"),
        "PriorityId" = COALESCE($4, "PriorityId"),
        "StatusId" = COALESCE($5, "StatusId"),
        "AssignedToUserId" = COALESCE($6, "AssignedToUserId"),
        "UpdatedAt" = CURRENT_TIMESTAMP
      WHERE "ID" = $7
      RETURNING *
      `,
      [
        title,
        description,
        categoryId,
        priorityId,
        statusId,
        assignedToUserId,
        ticketId,
      ]
    );

    return res.status(200).json({
      message: "Ticket updated successfully",
      ticket: result.rows[0],
    });
  } catch (error) {
    console.error("Update ticket error:", error);
    return res.status(500).json({
      message: "Server error while updating ticket",
    });
  }
};

module.exports = {
  createTicket,
  getTickets,
  updateTicket,
};