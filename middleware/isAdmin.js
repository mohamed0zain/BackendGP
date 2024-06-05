const conn = require("../db/dbConnection");
const util = require("util");

const isAdmin = async (req, res, next) => {
  const query = util.promisify(conn.query).bind(conn);
  const { token } = req.headers;

  try {
    const admin = await query("SELECT * FROM admin WHERE admin_token = ?", [token]);

    if (admin.length > 0) {
      next();
    } else {
      res.status(403).json({
        msg: "You are not authorized to access this route!",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports = isAdmin;
