const pool = require("../config/db");

const getStatuses = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        "ID",
        "StatusName"
      FROM "status"
      ORDER BY "ID"
      `
    );

    return res.status(200).json({
      statuses: result.rows,
    });
  } catch (error) {
    console.error("Get statuses error:", error);
    return res.status(500).json({
      message: "Server error while getting statuses",
    });
  }
};

module.exports = {
  getStatuses,
};