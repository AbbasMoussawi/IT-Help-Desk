const pool = require("../config/db");

const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        "ID",
        "CategoryName"
      FROM "category"
      ORDER BY "CategoryName"
      `
    );

    return res.status(200).json({
      categories: result.rows,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    return res.status(500).json({
      message: "Server error while getting categories",
    });
  }
};

module.exports = {
  getCategories,
};