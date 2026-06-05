const pool = require("../config/db");

const getPriorities = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        "ID",
        "PriorityName",
        "PriorityLevel"
      FROM "priority"
      ORDER BY "PriorityLevel" DESC
      `
    );

    return res.status(200).json({
      priorities: result.rows,
    });
  } catch (error) {
    console.error("Get priorities error:", error);
    return res.status(500).json({
      message: "Server error while getting priorities",
    });
  }
};

module.exports = {
  getPriorities,
};