const pool = require("../config/db");


const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        t."ID", 
        t."TicketNumber",
        t."Title",
        t."Description",
        t."CreatedAt",

        t."AssignedToUserId",
        t."StatusId",
        t."CategoryId",
        t."PriorityId",

        creator."FullName" AS "CreatedByName",
        assignee."FullName" AS "AssignedToName",

        s."StatusName",
        p."PriorityName",
        c."CategoryName"

      FROM ticket t
      LEFT JOIN status s ON t."StatusId" = s."ID"
      LEFT JOIN priority p ON t."PriorityId" = p."ID"
      LEFT JOIN category c ON t."CategoryId" = c."ID"

      LEFT JOIN "user" creator ON t."CreatedByUserId" = creator."ID"
      LEFT JOIN "user" assignee ON t."AssignedToUserId" = assignee."ID"

      WHERE t."ID" = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.log("GET TICKET ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

const updateTicketStatus = async (req, res) => {
  const role = req.user.role;
  if (role !== "Admin" && role !=="Manager" && role !== "IT Support") {
    return res.status(204).end();
  }
  try {
    const { id } = req.params;
    const { status } = req.body;

    const statusRes = await pool.query(
      `SELECT "ID" FROM status WHERE "StatusName" = $1`,
      [status]
    );

    if (statusRes.rows.length === 0) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const statusId = statusRes.rows[0].ID;

    await pool.query(
      `
      UPDATE ticket
      SET "StatusId" = $1,
          "UpdatedAt" = NOW()
      WHERE "ID" = $2
      `,
      [statusId, id]
    );

    res.json({ message: "Status updated" });
  } catch (err) {
    console.log("UPDATE STATUS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


const createTicket = async (req, res) => {
  try {
    console.log("BODY =", req.body);

    const {
      title,
      description,
      category,
      priority,
      assignedTo,
      department
    } = req.body;

    const userId = req.user.userId;

    const categoryId = parseInt(category);
    const priorityId = parseInt(priority);

    const statusRes = await pool.query(
      `SELECT "ID" FROM status WHERE "StatusName" = 'Open'`
    );

    console.log("categoryId =", categoryId);
    console.log("priorityId =", priorityId);
    console.log("statusRes =", statusRes.rows);

    if (
      isNaN(categoryId) ||
      isNaN(priorityId) ||
      statusRes.rows.length === 0
    ) {
      return res.status(400).json({
        message: "Invalid data"
      });
    }

    const statusId = statusRes.rows[0].ID;

    const seqRes = await pool.query(
      `SELECT nextval('ticket_number_seq') AS num`
    );

    const ticketNumber = `TK-${String(
      seqRes.rows[0].num
    ).padStart(5, "0")}`;

    const result = await pool.query(
      `
      INSERT INTO ticket
      (
        "TicketNumber",
        "Title",
        "Description",
        "CreatedByUserId",
        "AssignedToUserId",
        "DepartmentId",
        "CategoryId",
        "PriorityId",
        "StatusId",
        "CreatedAt",
        "UpdatedAt"
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,
        NOW(),
        NOW()
      )
      RETURNING *
      `,
      [
        ticketNumber,
        title,
        description,
        userId,
        assignedTo || null,
        department || null,
        categoryId,
        priorityId,
        statusId
      ]
    );

    const ticket = result.rows[0];

    await pool.query(
      `
      INSERT INTO ticket_activity
      (
        "TicketId",
        "UserId",
        "Action",
        "NewValue",
        "CreatedAt"
      )
      VALUES ($1,$2,$3,$4,NOW())
      `,
      [
        ticket.ID,
        userId,
        'Created Ticket',
        ticket.Title
      ]
    );

    let attachments = [];

    if (req.file) {
      const attachResult = await pool.query(
        `
        INSERT INTO attachment
        (
          "TicketId",
          "UploadedByUserID",
          "FilePath",
          "FileType",
          "FileSize",
          "CreatedAt"
        )
        VALUES ($1,$2,$3,$4,$5,NOW())
        RETURNING *
        `,
        [
          ticket.ID,
          userId,
          `/uploads/${req.file.filename}`,
          req.file.mimetype,
          req.file.size
        ]
      );

      attachments = attachResult.rows;
    }

    return res.status(201).json({
      message: "Ticket created successfully",
      ticket,
      attachments
    });

  } catch (err) {
    console.log("CREATE TICKET ERROR:", err);
    return res.status(500).json({
      message: err.message
    });
  }
};

const getTickets = async (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.user.userId;

    let query = `
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
        assignee."FullName" AS "AssignedToName",

        COUNT(a."ID")::int AS "AttachmentCount"

      FROM ticket t

      LEFT JOIN status s
        ON t."StatusId" = s."ID"

      LEFT JOIN priority p
        ON t."PriorityId" = p."ID"

      LEFT JOIN category c
        ON t."CategoryId" = c."ID"

      LEFT JOIN "user" creator
        ON t."CreatedByUserId" = creator."ID"

      LEFT JOIN "user" assignee
        ON t."AssignedToUserId" = assignee."ID"

      LEFT JOIN attachment a
        ON a."TicketId" = t."ID"

      WHERE t."AssignedToUserId" = $1
      AND t."IsActive" = TRUE
    `;

    const values = [userId];

    if (status) {
      query += ` AND s."StatusName" = $2 `;
      values.push(status);
    }

    query += `
      GROUP BY
        t."ID",
        t."TicketNumber",
        t."Title",
        t."Description",
        t."CreatedAt",
        s."StatusName",
        p."PriorityName",
        c."CategoryName",
        creator."FullName",
        assignee."FullName"

      ORDER BY t."CreatedAt" DESC
    `;

    const result = await pool.query(query, values);

    return res.json({
      tickets: result.rows,
    });

  } catch (err) {
    console.log("GET TICKETS ERROR:", err);

    return res.status(500).json({
      message: err.message,
    });
  }
};

const getTicketFormData = async (req, res) => {
  try {

    const usersRes = await pool.query(`
      SELECT u."ID", u."FullName"
      FROM "user" u
      INNER JOIN role r ON u."RoleId" = r."ID"
      WHERE r."RoleName" = 'IT Support'
      ORDER BY u."FullName"
    `);

    const deptRes = await pool.query(`
      SELECT "ID", "DepartmentName"
      FROM department
      ORDER BY "DepartmentName"
    `);
    const statusesRes = await pool.query(`
      SELECT "ID", "StatusName"
      FROM status
      ORDER BY "ID"
    `);
    const categoriesRes = await pool.query(`
      SELECT "ID", "CategoryName"
      FROM category
      ORDER BY "CategoryName"
    `);

    const prioritiesRes = await pool.query(`
      SELECT "ID", "PriorityName"
      FROM priority
      ORDER BY "ID"
    `);

    res.json({
      users: usersRes.rows,
      departments: deptRes.rows,
      statuses: statusesRes.rows,
      categories: categoriesRes.rows,
      priorities: prioritiesRes.rows
    });

  } catch (err) {
    console.log("FORM DATA ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

const getTicketForEdit = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT
        t."ID",
        t."Title",
        t."Description",

        t."AssignedToUserId",
        t."StatusId",
        t."CategoryId",
        t."PriorityId",

        a."FilePath"

      FROM ticket t
      LEFT JOIN attachment a ON a."TicketId" = t."ID"
      WHERE t."ID" = $1
    `,[id]);

    if(result.rows.length === 0){
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(result.rows[0]);

  } catch(err){
    res.status(500).json({ message: err.message });
  }
};

const updateTicket = async (req,res) => {
  try {

    const { id } = req.params;
    const role = req.user.role?.toLowerCase();

    if (!["admin", "manager"].includes(role)) {
      return res.status(403).json({
        message: "Not allowed to update ticket"
      });
    }
    const {
      title,
      description,
      assignedTo,
      status,
      category,
      priority
    } = req.body;


    await pool.query(`
      UPDATE ticket
      SET
        "Title"=$1,
        "Description"=$2,
        "AssignedToUserId"=$3,
        "StatusId"=$4,
        "CategoryId"=$5,
        "PriorityId"=$6,
        "UpdatedAt"=NOW()
      WHERE "ID"=$7
    `,[
      title,
      description,
      assignedTo || null,
      status || null,
      category || null,
      priority || null,
      id
    ]);
    await pool.query(
      `
      INSERT INTO ticket_activity
      (
        "TicketId",
        "UserId",
        "Action"
      )
      VALUES ($1,$2,$3)
      `,
      [
        id,
        req.user.userId,
        "Ticket Updated"
      ]
    );

    if (req.file) {
      await pool.query(
        `
        INSERT INTO attachment
        (
          "TicketId",
          "UploadedByUserID",
          "FilePath",
          "FileType",
          "FileSize",
          "CreatedAt"
        )
        VALUES ($1,$2,$3,$4,$5,NOW())
        `,
        [
          id,
          req.user.userId,
          `/uploads/${req.file.filename}`,
          req.file.mimetype,
          req.file.size
        ]
      );
    }

    res.json({
      message:"Ticket updated"
    });

  } catch(err){
    res.status(500).json({
      message: err.message
    });
  }
};

module.exports = {
  getTicketById,
  updateTicketStatus,
  createTicket,
  getTickets,
  getTicketFormData,
  getTicketForEdit,
  updateTicket,
};