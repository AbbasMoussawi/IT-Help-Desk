const pool = require("../config/db");
const { createNotification, notifyTicketUsers } = require("./notificationController");
const getTicketDetailsById  = async (req, res) => {
  console.log("TICKET DETAILS CONTROLLER");
  try {
    const ticketId = req.params.id;

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
        assignee."FullName" AS "AssignedToName",

        COALESCE(
          json_agg(
            json_build_object(
                'ID', a."ID",
                'FilePath', a."FilePath",
                'CreatedAt', a."CreatedAt",
                'UploadedBy', uploader."FullName"
            )
          ) FILTER (WHERE a."ID" IS NOT NULL),
          '[]'
        ) AS "Attachments"

      FROM ticket t

      LEFT JOIN status s ON t."StatusId" = s."ID"
      LEFT JOIN priority p ON t."PriorityId" = p."ID"
      LEFT JOIN category c ON t."CategoryId" = c."ID"
      LEFT JOIN "user" creator ON t."CreatedByUserId" = creator."ID"
      LEFT JOIN "user" assignee ON t."AssignedToUserId" = assignee."ID"
      LEFT JOIN attachment a ON t."ID" = a."TicketId"
      LEFT JOIN "user" uploader ON uploader."ID" = a."UploadedByUserID"

      WHERE t."ID" = $1

      GROUP BY 
        t."ID",
        s."StatusName",
        p."PriorityName",
        c."CategoryName",
        creator."FullName",
        assignee."FullName"
      `,
      [ticketId]
    );

    return res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};



const updateStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const io = req.app.get("io");
    const { id } = req.params;
    const { status } = req.body;
    const role = req.user.role;

    if (role === "Employee") {
      return res.status(403).json({
        message: "Employees cannot change status"
      });
    }

    const ticket = await pool.query(
      `
      SELECT 
        t."TicketNumber",
        t."CreatedByUserId",
        t."StatusId",
        s."StatusName"
      FROM ticket t
      JOIN status s ON t."StatusId" = s."ID"
      WHERE t."ID" = $1
      `,
      [id]
    );
    

    

    if (!ticket.rows.length) {
      return res.status(404).json({
        message: "Ticket not found"
      });
    }

    const oldStatus = ticket.rows[0].StatusName;

    if (oldStatus === "Closed") {
      return res.status(400).json({
        message: "Ticket is closed"
      });
    }

    await pool.query(
      `
      UPDATE ticket
      
      SET
        "StatusId" = (
          SELECT "ID"
          FROM status
          WHERE "StatusName" = $1
        ),
        "UpdatedAt" = NOW()
      WHERE "ID" = $2
      `,
      [status, id]
    );
    const userRes = await pool.query(
      `SELECT "FullName" FROM "user" WHERE "ID" = $1`,
      [req.user.userId]
    );

    const userName = userRes.rows[0].FullName;
    

    await notifyTicketUsers(req, id, req.user.userId, {
      title: "Ticket Status Changed",
      message: `${userName} changed status of Ticket ${ticket.rows[0].TicketNumber} to ${status}`,
      type: "status"
    });

    await pool.query(
      `
      INSERT INTO ticket_activity
      (
        "TicketId",
        "UserId",
        "Action",
        "OldValue",
        "NewValue"
      )
      VALUES ($1,$2,$3,$4,$5)
      `,
      [
        id,
        req.user.userId,
        "Status Changed",
        oldStatus,
        status
      ]
    );

    res.json({
      message: "Status updated successfully"
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message
    });
  }
};

const getTicketActivity = async (req, res) => {
  try {

    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        ta.*,
        u."FullName"
      FROM ticket_activity ta
      LEFT JOIN "user" u
        ON ta."UserId" = u."ID"
      WHERE ta."TicketId" = $1
      ORDER BY ta."CreatedAt" ASC
      `,
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};

module.exports = { 
  getTicketDetailsById ,
  updateStatus,
  getTicketActivity
};